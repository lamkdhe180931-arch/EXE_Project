import { AdminShell } from "@/components/admin/AdminShell";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { requireAdmin } from "@/lib/admin/require-admin";
import { signAdminCsrf } from "@/lib/auth/csrf";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await requireAdmin();
  const csrfToken = await signAdminCsrf(session);
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminShell>
      <section>
        <h2>Orders</h2>
        <div className="admin-list">
          {orders.map((order) => (
            <article key={order.id}>
              <h3>{order.customerName}</h3>
              <p>
                {order.customerPhone} - {order.shippingAddress}
              </p>
              <p>Total: {order.total}</p>
              <OrderStatusForm orderId={order.id} status={order.status} csrfToken={csrfToken} />
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.productName} x {item.quantity}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
