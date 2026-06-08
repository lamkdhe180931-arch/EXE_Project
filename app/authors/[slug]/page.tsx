import Image from "next/image";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/ProductCard";
import { getPublishedAuthorBySlug } from "@/lib/data/authors";

export const dynamic = "force-dynamic";

export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = await getPublishedAuthorBySlug(slug);
  if (!author) notFound();
  return (
    <main className="author-main">
      <section className="author-hero">
        <h1 className="author-name-title">{author.name}</h1>
        <p className="author-hero-subtitle">{author.subtitle}</p>
      </section>
      <section className="author-bio">
        <Image src={author.portraitSrc} alt={author.name} width={720} height={900} />
        <p>{author.bio}</p>
      </section>
      <section className="catalogue-grid">
        {author.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}
