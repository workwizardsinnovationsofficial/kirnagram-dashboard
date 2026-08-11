import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { AICreatorUserRow } from "@/components/admin/UsersDetailsTable";
import { getAdminHeaders } from "@/lib/adminAuth";

const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname) ? "https://api.kirnagram.com" : "https://api.kirnagram.com");

const formatNumber = (value?: number) => Number(value ?? 0).toLocaleString();

const CreatorBonus = () => {
  const [creators, setCreators] = useState<AICreatorUserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [allocations, setAllocations] = useState<Record<string, { money: number }>>({});
  const [allocating, setAllocating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadCreators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard/users?range=90days`);
      if (!res.ok) throw new Error("Failed to load creator data");
      const data = await res.json();
      const creatorsData = Array.isArray(data.ai_creator_users) ? data.ai_creator_users : [];
      setCreators(creatorsData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load creators");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  const filteredCreators = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return creators;
    return creators.filter((creator) =>
      creator.username?.toLowerCase().includes(query) ||
      creator.name?.toLowerCase().includes(query) ||
      creator.email?.toLowerCase().includes(query),
    );
  }, [creators, searchQuery]);

  const isInitialLoad = loading && creators.length === 0;

  const handleAllocationChange = (userId: string, value: string) => {
    const amount = Number(value) || 0;
    setAllocations((prev) => ({
      ...prev,
      [userId]: {
        money: amount,
      },
    }));
  };

  const handleGrantBonus = async (creator: AICreatorUserRow) => {
    const allocation = allocations[creator.user_id] || { money: 0 };
    const { money } = allocation;
    if (money <= 0) {
      toast.error("Enter a money amount to grant.");
      return;
    }

    setAllocating(creator.user_id);
    try {
      const authHeaders = await getAdminHeaders();
      if (!authHeaders.Authorization && !authHeaders["X-Local-Admin"]) {
        throw new Error("Admin authentication is missing. Please log in again.");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...authHeaders,
      };

      const res = await fetch(`${API_BASE}/admin/ai-creator/bonus`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          user_id: creator.user_id,
          money,
          reason: "admin_allocated_bonus",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || err?.message || "Failed to grant bonus");
      }
      const result = await res.json();
      setCreators((prev) => prev.map((item) => {
        if (item.user_id !== creator.user_id) return item;
        return {
          ...item,
          total_remaining_money: (item.total_remaining_money ?? 0) + money,
        };
      }));
      setAllocations((prev) => ({
        ...prev,
        [creator.user_id]: { money: 0 },
      }));
      toast.success(
        `Granted ₹${formatNumber(money)} to ${creator.username || creator.name}.`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to grant bonus.");
    } finally {
      setAllocating(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Creator Bonus Allocation</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Allocate bonus money to approved AI creators. Use prompt and remix volume to reward creators directly from the admin dashboard.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              placeholder="Search creators by name, username, or email"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="min-w-[240px]"
            />
            <Button variant="outline" onClick={loadCreators} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-auto rounded-3xl border border-border/70 bg-background/70 shadow-sm">
          {isInitialLoad ? (
            <div className="flex min-h-[260px] items-center justify-center p-10">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full border-4 border-border border-t-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Loading creators...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Creator</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Prompts</TableHead>
                  <TableHead>Remixes</TableHead>
                  <TableHead>Total Remaining</TableHead>
                  <TableHead>Bonus</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCreators.map((creator) => (
                  <TableRow key={creator.user_id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{creator.name || creator.username || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{creator.username || creator.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(creator.wallet)}</TableCell>
                    <TableCell>{formatNumber(creator.prompts_count)}</TableCell>
                    <TableCell>{formatNumber(creator.remixes_count)}</TableCell>
                    <TableCell>{formatNumber(creator.total_remaining_money)}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        placeholder="Money"
                        value={allocations[creator.user_id]?.money ?? ""}
                        onChange={(event) => handleAllocationChange(creator.user_id, event.target.value)}
                        className="w-32"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        disabled={allocating === creator.user_id}
                        onClick={() => handleGrantBonus(creator)}
                      >
                        {allocating === creator.user_id ? "Granting..." : "Grant Bonus"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCreators.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <div className="py-8 text-center text-sm text-muted-foreground">No creators found.</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Badge variant="secondary">Total creators: {filteredCreators.length}</Badge>
          <Badge variant="secondary">Showing last 90 days of creators</Badge>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreatorBonus;
