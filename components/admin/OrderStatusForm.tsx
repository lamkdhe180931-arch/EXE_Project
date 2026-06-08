import { OrderStatus } from "@prisma/client";
import { updateOrderStatus } from "@/app/admin/orders/actions";

export function OrderStatusForm({ orderId, status, csrfToken }: { orderId: string; status: OrderStatus; csrfToken: string }) {
  return (
    <form action={updateOrderStatus}>
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <select name="status" defaultValue={status}>
        <option value="new">New</option>
        <option value="confirmed">Confirmed</option>
        <option value="fulfilled">Fulfilled</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button type="submit">Update</button>
    </form>
  );
}
