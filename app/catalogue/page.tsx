import { ProductCard } from "@/components/site/ProductCard";
import { listPublishedProducts } from "@/lib/data/products";

export const dynamic = "force-dynamic";

type CataloguePageProps = {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
};

export default async function CataloguePage({ searchParams }: CataloguePageProps) {
  const params = await searchParams;
  const products = await listPublishedProducts(params);
  return (
    <main className="catalogue-main">
      <section className="catalogue-meta-bar">
        <span className="product-count">{products.length} sản phẩm</span>
      </section>
      <section className="catalogue-grid-section">
        <div className="catalogue-grid">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
