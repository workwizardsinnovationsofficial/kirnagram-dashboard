import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { UsersDetailsTable, NormalUserRow, AICreatorUserRow } from "@/components/admin/UsersDetailsTable";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

interface UsersApiResponse {
  normal_users: NormalUserRow[];
  ai_creator_users: AICreatorUserRow[];
  total_users: number;
}

const UsersPage = () => {
  const [normalUsers, setNormalUsers] = useState<NormalUserRow[]>([]);
  const [aiCreatorUsers, setAiCreatorUsers] = useState<AICreatorUserRow[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/admin/dashboard/users?range=30days`);
        if (!response.ok) {
          throw new Error("Failed to load all users.");
        }
        const data: UsersApiResponse = await response.json();
        setNormalUsers(Array.isArray(data.normal_users) ? data.normal_users : []);
        setAiCreatorUsers(Array.isArray(data.ai_creator_users) ? data.ai_creator_users : []);
        setTotalUsers(data.total_users ?? 0);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load users.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">All Users</h1>
            <p className="text-sm text-muted-foreground">
              Browse every user in the system with pagination and export options.
            </p>
          </div>
          <div className="rounded-md bg-muted/60 px-3 py-1.5 text-sm font-medium text-foreground">
            Total Users: {totalUsers.toLocaleString()}
          </div>
        </div>

        <UsersDetailsTable
          normalUsers={normalUsers}
          aiCreatorUsers={aiCreatorUsers}
          totalUsers={totalUsers}
          loading={loading}
          showViewAllButton={false}
        />
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
