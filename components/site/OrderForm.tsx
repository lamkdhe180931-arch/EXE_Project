"use client";

import { useState } from "react";

export function OrderForm({ productId }: { productId: string }) {
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: formData.get("customerName"),
        customerEmail: formData.get("customerEmail"),
        customerPhone: formData.get("customerPhone"),
        shippingAddress: formData.get("shippingAddress"),
        note: formData.get("note"),
        items: [{ productId, quantity: Number(formData.get("quantity") ?? 1) }]
      })
    });
    setMessage(response.ok ? "Đơn hàng đã được ghi nhận." : "Không thể tạo đơn hàng. Vui lòng kiểm tra thông tin.");
  }

  return (
    <form className="order-form" action={submit}>
      <label>
        Họ tên
        <input name="customerName" required />
      </label>
      <label>
        Email
        <input name="customerEmail" type="email" />
      </label>
      <label>
        Số điện thoại
        <input name="customerPhone" required />
      </label>
      <label>
        Địa chỉ nhận hàng
        <input name="shippingAddress" required />
      </label>
      <label>
        Số lượng
        <input name="quantity" type="number" min="1" defaultValue="1" required />
      </label>
      <label>
        Ghi chú
        <textarea name="note" />
      </label>
      <button type="submit">Mua ngay</button>
      {message ? <p>{message}</p> : null}
    </form>
  );
}
