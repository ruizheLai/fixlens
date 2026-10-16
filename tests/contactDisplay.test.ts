import { test } from "node:test";
import assert from "node:assert/strict";
import { contactDisplay, availableContact } from "../src/utils/contactDisplay.ts";

test("Contact presentation omits unavailable demo phone without changing data", () => {
  assert.equal(contactDisplay("renter@example.com", "Not provided (Demo)"), "renter@example.com");
  assert.equal(contactDisplay("renter@example.com", "0400 123 456"), "renter@example.com · 0400 123 456");
  assert.equal(contactDisplay(null, " "), "Contact details unavailable");
  assert.equal(contactDisplay(undefined, "0400 123 456"), "0400 123 456");
  assert.equal(availableContact("Not provided (Demo)"), undefined);
});
