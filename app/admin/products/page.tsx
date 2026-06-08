import { AdminShell } from "@/components/admin/AdminShell";
import { ProductForm } from "@/components/admin/ProductForm";
import { requireAdmin } from "@/lib/admin/require-admin";
import { signAdminCsrf } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { saveProduct } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await requireAdmin();
  const csrfToken = await signAdminCsrf(session);
  const [products, categories, authors] = await Promise.all([
    prisma.product.findMany({ include: { images: true, category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.author.findMany({ orderBy: { name: "asc" } })
  ]);

  return (
    <AdminShell>
      <section>
        <h2>Products</h2>
        <ProductForm categories={categories} authors={authors} csrfToken={csrfToken} action={saveProduct} />
        <div className="admin-list">
          {products.map((product) => (
            <article key={product.id}>
              <h3>{product.name}</h3>
              <p>
                {product.category.name} - {product.status} - {product.price}
              </p>
              <ProductForm product={product} categories={categories} authors={authors} csrfToken={csrfToken} action={saveProduct} />
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
