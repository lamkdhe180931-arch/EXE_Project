import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin/require-admin";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const [productCount, publishedProductCount, authorCount, newOrderCount, recentOrders] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: "published" } }),
    prisma.author.count(),
    prisma.order.count({ where: { status: "new" } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 })
  ]);

  return (
    <AdminShell>
      <section>
        <h2>Dashboard</h2>
        <div className="admin-metrics">
          <span>Products: {productCount}</span>
          <span>Published: {publishedProductCount}</span>
          <span>Authors: {authorCount}</span>
          <span>New Orders: {newOrderCount}</span>
        </div>
        <h3>Recent Orders</h3>
        <ul>
          {recentOrders.map((order) => (
            <li key={order.id}>
              {order.customerName} - {order.status} - {order.total}
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
