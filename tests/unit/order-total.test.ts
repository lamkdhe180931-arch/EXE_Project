import test from "node:test";
import assert from "node:assert/strict";
import { calculateOrderTotal } from "@/lib/data/orders";

test("calculateOrderTotal sums line totals", () => {
  assert.equal(
    calculateOrderTotal([
      { unitPrice: 350000, quantity: 2 },
      { unitPrice: 250000, quantity: 1 }
    ]),
    950000
  );
});
