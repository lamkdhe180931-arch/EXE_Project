import { Author, Category, Product, ProductImage } from "@prisma/client";

type ProductWithImages = Product & { images: ProductImage[] };

export function ProductForm({
  product,
  categories,
  authors,
  csrfToken,
  action
}: {
  product?: ProductWithImages;
  categories: Category[];
  authors: Author[];
  csrfToken: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form className="admin-form" action={action}>
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <label>
        Name
        <input name="name" defaultValue={product?.name ?? ""} required />
      </label>
      <label>
        Slug
        <input name="slug" defaultValue={product?.slug ?? ""} required />
      </label>
      <label>
        Description
        <textarea name="description" defaultValue={product?.description ?? ""} required />
      </label>
      <label>
        Story
        <textarea name="story" defaultValue={product?.story ?? ""} required />
      </label>
      <label>
        Price
        <input name="price" type="number" defaultValue={product?.price ?? 0} min="0" required />
      </label>
      <label>
        Stock
        <input name="stock" type="number" defaultValue={product?.stock ?? 0} min="0" required />
      </label>
      <label>
        Category
        <select name="categoryId" defaultValue={product?.categoryId ?? categories[0]?.id}>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Author
        <select name="authorId" defaultValue={product?.authorId ?? ""}>
          <option value="">No author</option>
          {authors.map((author) => (
            <option key={author.id} value={author.id}>
              {author.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Status
        <select name="status" defaultValue={product?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>
      <label>
        Image paths
        <textarea name="imageSrcs" defaultValue={product?.images.map((image) => image.src).join("\n") ?? ""} />
      </label>
      <button type="submit">{product ? "Update product" : "Create product"}</button>
    </form>
  );
}
