import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../../lib/auth/password.ts";

test("verifyPassword accepts matching password", async () => {
  const hash = await hashPassword("ChangeMe123!");
  assert.equal(await verifyPassword("ChangeMe123!", hash), true);
});

test("verifyPassword rejects non-matching password", async () => {
  const hash = await hashPassword("ChangeMe123!");
  assert.equal(await verifyPassword("wrong-password", hash), false);
});
