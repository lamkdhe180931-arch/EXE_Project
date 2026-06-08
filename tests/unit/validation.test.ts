import test from "node:test";
import assert from "node:assert/strict";
import { createOrderSchema } from "../../lib/validation.ts";

test("createOrderSchema rejects empty order items", () => {
  const result = createOrderSchema.safeParse({
    customerName: "Lam",
    customerPhone: "0900000000",
    shippingAddress: "FPT University",
    items: []
  });
  assert.equal(result.success, false);
});

test("createOrderSchema accepts a valid order", () => {
  const result = createOrderSchema.safeParse({
    customerName: "Lam",
    customerPhone: "0900000000",
    shippingAddress: "FPT University",
    items: [{ productId: "product_1", quantity: 2 }]
  });
  assert.equal(result.success, true);
});
