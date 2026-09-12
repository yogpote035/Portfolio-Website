import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import {
  clearAuthTokens,
  fetchApiAuth,
  getAccessToken,
  getRefreshToken,
  isTokenExpiring,
  setAuthTokens,
} from "./authClient.js";

class MemoryStorage {
  #values = new Map();

  getItem(key) {
    return this.#values.get(key) ?? null;
  }

  setItem(key, value) {
    this.#values.set(key, String(value));
  }

  removeItem(key) {
    this.#values.delete(key);
  }

  clear() {
    this.#values.clear();
  }
}

globalThis.localStorage = new MemoryStorage();

function tokenWithExpiry(exp) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "none" })}.${encode({ exp })}.signature`;
}

function apiResponse(data, status = 200, message = "OK") {
  return new Response(JSON.stringify({ success: status < 400, message, data }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  clearAuthTokens();
});

test("detects valid, expiring, malformed, and unpadded JWT payloads", () => {
  const now = 2_000_000_000_000;
  assert.equal(isTokenExpiring(tokenWithExpiry(now / 1000 + 60), 30, now), false);
  assert.equal(isTokenExpiring(tokenWithExpiry(now / 1000 + 10), 30, now), true);
  assert.equal(isTokenExpiring("malformed", 30, now), true);
});

test("deduplicates concurrent proactive token refreshes", async () => {
  const expiredToken = tokenWithExpiry(1);
  const freshToken = tokenWithExpiry(Math.floor(Date.now() / 1000) + 3600);
  setAuthTokens({ accessToken: expiredToken, refreshToken: "refresh-token" });
  let refreshCalls = 0;
  let dataCalls = 0;

  globalThis.fetch = async (url, options) => {
    if (url.endsWith("/api/auth/refresh-token")) {
      refreshCalls += 1;
      await Promise.resolve();
      return apiResponse({ accessToken: freshToken, refreshToken: "rotated" });
    }
    dataCalls += 1;
    assert.equal(options.headers.Authorization, `Bearer ${freshToken}`);
    return apiResponse({ id: dataCalls });
  };

  await Promise.all([
    fetchApiAuth("/api/admin/projects"),
    fetchApiAuth("/api/admin/skills"),
  ]);

  assert.equal(refreshCalls, 1);
  assert.equal(dataCalls, 2);
  assert.equal(getRefreshToken(), "rotated");
});

test("retries a 401 once with a refreshed token", async () => {
  const initialToken = tokenWithExpiry(Math.floor(Date.now() / 1000) + 3600);
  const freshToken = tokenWithExpiry(Math.floor(Date.now() / 1000) + 7200);
  setAuthTokens({ accessToken: initialToken, refreshToken: "refresh-token" });
  let dataCalls = 0;

  globalThis.fetch = async (url, options) => {
    if (url.endsWith("/api/auth/refresh-token")) {
      return apiResponse({ accessToken: freshToken, refreshToken: "rotated" });
    }
    dataCalls += 1;
    if (dataCalls === 1) return apiResponse(null, 401, "Access token expired");
    assert.equal(options.headers.Authorization, `Bearer ${freshToken}`);
    return apiResponse({ restored: true });
  };

  assert.deepEqual(await fetchApiAuth("/api/admin/projects"), { restored: true });
  assert.equal(dataCalls, 2);
});

test("preserves browser-generated FormData headers", async () => {
  const accessToken = tokenWithExpiry(Math.floor(Date.now() / 1000) + 3600);
  setAuthTokens({ accessToken, refreshToken: "refresh-token" });
  const formData = new FormData();
  formData.append("image", new Blob(["image"]), "image.png");

  globalThis.fetch = async (_url, options) => {
    assert.equal(options.headers["Content-Type"], undefined);
    assert.equal(options.headers.Authorization, `Bearer ${accessToken}`);
    return apiResponse({ uploaded: true });
  };

  await fetchApiAuth("/api/admin/media/images", {
    method: "POST",
    body: formData,
  });
});

test("clears tokens when refresh fails", async () => {
  setAuthTokens({ accessToken: tokenWithExpiry(1), refreshToken: "invalid" });
  globalThis.fetch = async () => apiResponse(null, 401, "Invalid refresh token");

  await assert.rejects(() => fetchApiAuth("/api/admin/projects"), /Invalid refresh token/);
  assert.equal(getAccessToken(), null);
  assert.equal(getRefreshToken(), null);
});
