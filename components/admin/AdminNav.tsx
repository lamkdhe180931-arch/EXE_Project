import Link from "next/link";

export function AdminNav() {
  return (
    <nav className="admin-nav">
      <Link href="/admin">Dashboard</Link>
      <Link href="/admin/products">Products</Link>
      <Link href="/admin/authors">Authors</Link>
      <Link href="/admin/orders">Orders</Link>
      <form action="/api/admin/logout" method="post">
        <button type="submit">Logout</button>
      </form>
    </nav>
  );
}
