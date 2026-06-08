import type { Category, Product, ProductImage } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { formatVnd } from "@/lib/money";

type ProductCardProps = {
  product: Product & { images: ProductImage[]; category: Category };
};

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images[0];
  return (
    <article className="product-card aspect-square" data-category={product.category.slug} data-price={product.price}>
      <Link href={`/products/${product.slug}`} className="product-card-link">
        <div className="product-image-wrapper bg-cream-warm">
          {primaryImage ? (
            <Image src={primaryImage.src} alt={primaryImage.alt} width={600} height={600} className="product-image" />
          ) : null}
        </div>
        <div className="product-card-meta">
          <div className="product-meta-left">
            <span className="product-card-title">{product.name}</span>
            <span className="product-card-category-price">
              {product.category.name} / {formatVnd(product.price)}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
