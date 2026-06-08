import { Author } from "@prisma/client";

export function AuthorForm({
  author,
  csrfToken,
  action
}: {
  author?: Author;
  csrfToken: string;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form className="admin-form" action={action}>
      <input type="hidden" name="id" value={author?.id ?? ""} />
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <label>
        Name
        <input name="name" defaultValue={author?.name ?? ""} required />
      </label>
      <label>
        Slug
        <input name="slug" defaultValue={author?.slug ?? ""} required />
      </label>
      <label>
        Subtitle
        <input name="subtitle" defaultValue={author?.subtitle ?? ""} required />
      </label>
      <label>
        Style
        <input name="style" defaultValue={author?.style ?? ""} required />
      </label>
      <label>
        Portrait path
        <input name="portraitSrc" defaultValue={author?.portraitSrc ?? ""} required />
      </label>
      <label>
        Bio
        <textarea name="bio" defaultValue={author?.bio ?? ""} required />
      </label>
      <label>
        Status
        <select name="status" defaultValue={author?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </label>
      <button type="submit">{author ? "Update author" : "Create author"}</button>
    </form>
  );
}
