// Slug helpers cho create/update ở admin. Cho phép bỏ trống slug: tự sinh từ
// tên/tiêu đề (xử lý tiếng Việt — bỏ dấu) và bảo đảm DUY NHẤT.

// "Áo Mèo Nổ" → "ao-meo-no" ; "" → "".
function slugify(input) {
  return String(input == null ? '' : input)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // bỏ dấu thanh tổ hợp (combining marks)
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Trả về slug duy nhất trong `model` (Prisma delegate có findUnique).
// Đụng độ → thêm -2, -3, … `currentId` được loại trừ (dùng khi update chính nó).
async function uniqueSlug(model, base, currentId) {
  const root = base || 'muc';
  let candidate = root;
  for (let i = 2; i < 1000; i++) {
    const found = await model.findUnique({ where: { slug: candidate } });
    if (!found || found.id === currentId) return candidate;
    candidate = root + '-' + i;
  }
  // Cực hiếm: 998 biến thể đều trùng → gắn hậu tố thời gian cho chắc chắn duy nhất.
  return root + '-' + Date.now().toString(36);
}

// Quyết định slug cuối cho create/update:
//   slug người dùng nhập (nếu có) → suy từ `deriveFrom` (tên/tiêu đề) → `fallback`.
//   Luôn được làm duy nhất.
async function resolveSlug(model, provided, deriveFrom, fallback, currentId) {
  const base = slugify(provided) || slugify(deriveFrom) || fallback;
  return uniqueSlug(model, base, currentId == null ? null : currentId);
}

module.exports = { slugify, uniqueSlug, resolveSlug };
