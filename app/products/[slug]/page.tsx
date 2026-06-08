import { notFound } from "next/navigation";
import { OrderForm } from "@/components/site/OrderForm";
import { ProductGallery } from "@/components/site/ProductGallery";
import { getPublishedProductBySlug } from "@/lib/data/products";
import { formatVnd } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="pdp-main">
      <section className="pdp-showcase">
        <ProductGallery images={product.images} />
        <div className="pdp-info">
          <h1 className="pdp-product-title">{product.name}</h1>
          <div className="pdp-price">{formatVnd(product.price)}</div>
          <p className="pdp-stock">{product.stock > 0 ? "Còn hàng" : "Hết hàng"}</p>
          <p>{product.description}</p>
          <OrderForm productId={product.id} />
        </div>
      </section>
    </main>
  );
}
