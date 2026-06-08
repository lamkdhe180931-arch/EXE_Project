export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0
  }).format(amount);
}

export function toLineTotal(unitPrice: number, quantity: number): number {
  return unitPrice * quantity;
}

export function calculateOrderTotal(items: Array<{ unitPrice: number; quantity: number }>): number {
  return items.reduce((total, item) => total + toLineTotal(item.unitPrice, item.quantity), 0);
}
