import test from "node:test";
import assert from "node:assert/strict";
import { getNextDisplayOrder } from "./displayOrder.js";

test("suggests the next display order from existing content", () => {
  assert.equal(getNextDisplayOrder([]), 1);
  assert.equal(getNextDisplayOrder([{ display_order: 1 }, { display_order: 3 }]), 4);
  assert.equal(getNextDisplayOrder([{ displayOrder: 7 }, { display_order: 2 }]), 8);
  assert.equal(getNextDisplayOrder([{ display_order: "5" }, { display_order: null }]), 6);
});