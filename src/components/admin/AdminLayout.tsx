import { ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="ml-64 min-h-screen transition-all duration-300 bg-gradient-to-br from-background via-background to-secondary/35">
        {children}
      </main>
    </div>
  );
}
