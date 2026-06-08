import test from "node:test";
import assert from "node:assert/strict";
import { slugify } from "../../lib/slug.ts";

test("slugify handles Vietnamese product names", () => {
  assert.equal(slugify("Áo Đồ Để Chơi Chất Để Đời"), "ao-do-de-choi-chat-de-doi");
});
