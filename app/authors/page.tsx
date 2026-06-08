import Image from "next/image";
import Link from "next/link";
import { listPublishedAuthors } from "@/lib/data/authors";

export const dynamic = "force-dynamic";

export default async function AuthorsPage() {
  const authors = await listPublishedAuthors();
  return (
    <main className="authors-main">
      <section className="team">
        <div className="wavy-slider-track">
          {authors.map((author) => (
            <Link key={author.id} href={`/authors/${author.slug}`} className="artist-wavy-card">
              <div className="artist-card-img-wrapper">
                <Image src={author.portraitSrc} alt={author.name} width={480} height={640} className="artist-card-img" />
              </div>
              <div className="artist-meta-box">
                <h3 className="artist-card-name">{author.name}</h3>
                <p className="artist-card-style">{author.style}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
