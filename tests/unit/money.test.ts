import test from "node:test";
import assert from "node:assert/strict";
import { formatVnd, toLineTotal } from "../../lib/money.ts";

test("toLineTotal multiplies price and quantity", () => {
  assert.equal(toLineTotal(350000, 2), 700000);
});

test("formatVnd includes Vietnamese currency marker", () => {
  assert.match(formatVnd(350000), /350\.000|350,000/);
});
