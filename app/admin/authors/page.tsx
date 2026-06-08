import { AdminShell } from "@/components/admin/AdminShell";
import { AuthorForm } from "@/components/admin/AuthorForm";
import { requireAdmin } from "@/lib/admin/require-admin";
import { signAdminCsrf } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";
import { saveAuthor } from "./actions";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const session = await requireAdmin();
  const csrfToken = await signAdminCsrf(session);
  const authors = await prisma.author.findMany({ orderBy: { name: "asc" } });
  return (
    <AdminShell>
      <section>
        <h2>Authors</h2>
        <AuthorForm csrfToken={csrfToken} action={saveAuthor} />
        <div className="admin-list">
          {authors.map((author) => (
            <article key={author.id}>
              <h3>{author.name}</h3>
              <p>
                {author.style} - {author.status}
              </p>
              <AuthorForm author={author} csrfToken={csrfToken} action={saveAuthor} />
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
