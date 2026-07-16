import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const API_BASE = "http://127.0.0.1:8000";

const Currency = () => {
  const { toast } = useToast();
  const [minWithdraw, setMinWithdraw] = useState(100);
  const [saving, setSaving] = useState(false);
  const [withdrawRequests, setWithdrawRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH CURRENT MIN VALUE
  // =========================
  const fetchSetting = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/withdraw/settings`);

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch");

      setMinWithdraw(data.min_withdraw_amount || 100);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Fetch all withdrawal requests and creator stats
  const fetchWithdrawRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/withdraw/requests`);
      if (res.status === 404) {
        setWithdrawRequests([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to fetch requests");
      setWithdrawRequests(data);
    } catch (err: any) {
      // Only show error if not 404 (no requests is not an error)
      if (!err.message?.includes('404')) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
      setWithdrawRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
    fetchWithdrawRequests();
  }, []);

  // =========================
  // UPDATE MIN WITHDRAW
  // =========================
  const handleUpdate = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/admin/withdraw/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          min_withdraw_amount: Number(minWithdraw),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Update failed");

      toast({
        title: "Success",
        description: "Minimum withdraw updated successfully",
      });
      fetchWithdrawRequests();

    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async (req: any) => {
    try {
      const res = await fetch(`${API_BASE}/admin/withdraw/requests/${req._id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to approve request");

      toast({ title: "Approved", description: `Withdrawal approved for ${req.user_id}` });
      fetchWithdrawRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleReject = async (req: any) => {
    try {
      const reason = window.prompt("Rejection reason (optional)") || "";
      const url = reason
        ? `${API_BASE}/admin/withdraw/requests/${req._id}/reject?reason=${encodeURIComponent(reason)}`
        : `${API_BASE}/admin/withdraw/requests/${req._id}/reject`;

      const res = await fetch(url, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to reject request");

      toast({ title: "Rejected", description: `Withdrawal rejected for ${req.user_id}` });
      fetchWithdrawRequests();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Minimum Withdraw Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="number"
                min={1}
                value={minWithdraw}
                onChange={(event) => setMinWithdraw(Number(event.target.value) || 0)}
                className="w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <Button onClick={handleUpdate} disabled={saving || minWithdraw <= 0}>
                {saving ? "Saving..." : "Update"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              This value applies to all users. Example: 100, 200, 500.
            </p>
          </CardContent>
        </Card>

        <div className="bg-muted/30 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Withdrawal Requests & Creator Stats</h2>
          <p className="text-sm text-muted-foreground mb-4">Current minimum withdraw: ₹{minWithdraw}</p>
          {loading ? (
            <div>Loading...</div>
          ) : withdrawRequests.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No withdrawal requests found.</div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {withdrawRequests.map((req, i) => (
                <Card key={req._id || i}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                      <span>₹{req.amount}</span>
                      {req.status === "approved" ? <Badge variant="default">Approved</Badge> : req.status === "rejected" ? <Badge variant="destructive">Rejected</Badge> : <Badge variant="secondary">Pending</Badge>}
                    </CardTitle>
                    {req.full_name && (
                      <p className="text-sm font-medium text-muted-foreground mt-1">{req.full_name}{req.username ? ` · @${req.username}` : ""}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    {/* Creator Profile Details */}
                    {req.full_name && (
                      <div className="mb-2 text-sm"><b>Name:</b> {req.full_name}</div>
                    )}
                    {req.username && (
                      <div className="mb-2 text-sm"><b>Username:</b> @{req.username}</div>
                    )}
                    {req.email && (
                      <div className="mb-2 text-sm"><b>Email:</b> {req.email}</div>
                    )}
                    {req.mobile && (
                      <div className="mb-2 text-sm"><b>Mobile:</b> {req.mobile}</div>
                    )}
                    {req.gender && (
                      <div className="mb-2 text-sm capitalize"><b>Gender:</b> {req.gender}</div>
                    )}
                    <hr className="my-3 border-border" />
                    <div className="mb-2 text-sm"><b>UPI ID:</b> {req.upi_id}</div>
                    <div className="mb-2 text-sm"><b>Applied Minimum:</b> ₹{req.min_withdraw_amount ?? minWithdraw}</div>
                    <div className="mb-2 text-sm"><b>Total Prompts:</b> {req.total_prompts}</div>
                    <div className="mb-2 text-sm"><b>Remixes:</b> {req.total_remixes}</div>
                    <div className="mb-2 text-sm"><b>Likes:</b> {req.total_likes}</div>
                    <div className="mb-2 text-sm"><b>Views:</b> {req.total_views}</div>
                    <div className="mb-2 text-sm"><b>Total Earned:</b> ₹{req.total_earned}</div>
                    <div className="mb-2 text-sm"><b>Total Withdrawn:</b> ₹{req.total_withdrawn}</div>
                    <div className="mb-2 text-sm font-bold"><b>Remaining:</b> ₹{req.remaining}</div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    {req.status === "pending" && (
                      <>
                        <Button variant="default" onClick={() => handleApprove(req)}>Approve</Button>
                        <Button variant="destructive" onClick={() => handleReject(req)}>Reject</Button>
                      </>
                    )}
                    {req.status === "approved" && <span className="text-green-600">Approved</span>}
                    {req.status === "rejected" && <span className="text-red-600">Rejected</span>}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Currency;
