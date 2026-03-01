import AdminSidebar from "@/components/layout/admin-sidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell flex">
      <AdminSidebar />
      <main className="admin-main min-h-screen flex-1">
        <div className="admin-panel min-h-[calc(100dvh-3rem)] p-5 lg:p-6">{children}</div>
      </main>
    </div>
  );
}
