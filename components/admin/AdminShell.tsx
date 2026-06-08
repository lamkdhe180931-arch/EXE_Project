import { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h1>Artdict Admin</h1>
        <AdminNav />
      </aside>
      <main className="admin-content">{children}</main>
    </div>
  );
}
