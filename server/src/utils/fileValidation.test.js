import assert from "node:assert/strict";
import test from "node:test";
import { validateImageFile, validateResumeFile } from "./fileValidation.js";

const image = (overrides = {}) => ({
  buffer: Buffer.from("image"),
  mimetype: "image/png",
  originalname: "image.png",
  size: 5,
  ...overrides,
});

test("accepts supported images and rejects invalid image input", () => {
  assert.doesNotThrow(() => validateImageFile(image()));
  assert.throws(
    () => validateImageFile(image({ mimetype: "image/bmp", originalname: "image.bmp" })),
    (error) => error.statusCode === 415,
  );
  assert.throws(
    () => validateImageFile(image({ size: 5 * 1024 * 1024 + 1 })),
    (error) => error.statusCode === 413,
  );
});

test("accepts supported resumes and rejects invalid resume input", () => {
  const resume = {
    buffer: Buffer.from("resume"),
    mimetype: "application/pdf",
    originalname: "resume.pdf",
    size: 6,
  };
  assert.doesNotThrow(() => validateResumeFile(resume));
  assert.throws(
    () => validateResumeFile({ ...resume, mimetype: "text/plain", originalname: "resume.txt" }),
    (error) => error.statusCode === 415,
  );
});
