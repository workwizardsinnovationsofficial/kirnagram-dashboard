import { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, CheckCircle, XCircle, Clock, MoreVertical, ShieldAlert, ShieldBan, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { AICreatorRequest } from "@/types/aiCreatorRequest";
import { Instagram, Youtube, Linkedin, Globe, X as XIcon, Phone, Calendar } from "lucide-react";

const API_URL = "http://localhost:8000/admin/ai-creator/applications"; // Adjusted to match backend

const AICreatorRequests = () => {
  const [requests, setRequests] = useState<AICreatorRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [suspendDays, setSuspendDays] = useState("7");
  const [suspendReason, setSuspendReason] = useState("Illegal activity");
  const [blockReason, setBlockReason] = useState("Illegal activity");

  useEffect(() => {
    // Fetch from backend
    const fetchRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Failed to fetch applications");
        const data = await res.json();
        // Map backend data to frontend type
        const mapped = data.map((app: any) => ({
          id: app._id || app.id,
          userId: app.user_id,
          username: app.full_name || app.name || "", // fallback
          email: app.email,
          name: app.full_name || app.name || "",
          mobile: app.mobile,
          dob: app.dob,
          instagram: app.instagram,
          youtube: app.youtube,
          x: app.x,
          linkedin: app.linkedin,
          website: app.website,
          status: app.status,
          reason: app.reason,
          suspensionDays: app.suspension_days,
          suspendedUntil: app.suspended_until,
          suspensionReason: app.suspension_reason,
          blockReason: app.block_reason,
          submittedAt: app.submitted_at ? new Date(app.submitted_at) : new Date(),
        }));
        setRequests(mapped);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    const filtered = requests.filter((req) =>
      req.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const order = {
      approved: 0,
      pending: 1,
      suspended: 2,
      blocked: 3,
      modify: 2,
      rejected: 4,
    } as const;

    return filtered.sort((a, b) => {
      const statusA = order[a.status] ?? 99;
      const statusB = order[b.status] ?? 99;
      if (statusA !== statusB) return statusA - statusB;
      return b.submittedAt.getTime() - a.submittedAt.getTime();
    });
  }, [requests, searchQuery]);

  // Approve/reject handlers (call backend)
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/admin/ai-creator/applications/${id}/approve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to approve");
      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: "approved" as const,
                suspensionDays: undefined,
                suspendedUntil: undefined,
                suspensionReason: undefined,
                blockReason: undefined,
              }
            : req
        ),
      );
      toast.success("AI Creator request approved!");
    } catch (e: any) {
      toast.error(e.message || "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:8000/admin/ai-creator/applications/${id}/reject`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to reject");
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status: "rejected" as const } : req)),
      );
      toast.error("AI Creator request rejected.");
    } catch (e: any) {
      toast.error(e.message || "Failed to reject");
    }
  };

  const openSuspendDialog = (id: string) => {
    setSelectedRequestId(id);
    setSuspendDays("7");
    setSuspendReason("Illegal activity");
    setSuspendDialogOpen(true);
  };

  const submitSuspend = async () => {
    if (!selectedRequestId) return;
    const days = Number(suspendDays);
    if (!Number.isInteger(days) || days <= 0) {
      toast.error("Please enter a valid number of days.");
      return;
    }
    const reason = suspendReason.trim() || "Illegal activity";
    try {
      const res = await fetch(`http://localhost:8000/admin/ai-creator/applications/${selectedRequestId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days, reason }),
      });
      if (!res.ok) throw new Error("Failed to suspend creator");
      const data = await res.json();

      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequestId
            ? {
                ...req,
                status: "suspended" as const,
                suspensionDays: days,
                suspendedUntil: data?.suspended_until,
                suspensionReason: reason,
                blockReason: undefined,
              }
            : req
        )
      );
      toast.success(`Creator suspended for ${days} day(s).`);
      setSuspendDialogOpen(false);
      setSelectedRequestId(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to suspend creator");
    }
  };

  const openBlockDialog = (id: string) => {
    setSelectedRequestId(id);
    setBlockReason("Illegal activity");
    setBlockDialogOpen(true);
  };

  const submitBlock = async () => {
    if (!selectedRequestId) return;
    const reason = blockReason.trim() || "Illegal activity";
    try {
      const res = await fetch(`http://localhost:8000/admin/ai-creator/applications/${selectedRequestId}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error("Failed to block creator");

      setRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequestId
            ? {
                ...req,
                status: "blocked" as const,
                blockReason: reason,
                suspensionDays: undefined,
                suspendedUntil: undefined,
                suspensionReason: undefined,
              }
            : req
        )
      );
      toast.success("Creator account blocked.");
      setBlockDialogOpen(false);
      setSelectedRequestId(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to block creator");
    }
  };

  const handleRevoke = async (id: string) => {
    const confirmed = window.confirm("Revoke suspension/block and restore this creator account?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/admin/ai-creator/applications/${id}/revoke`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to revoke restriction");

      setRequests((prev) =>
        prev.map((req) =>
          req.id === id
            ? {
                ...req,
                status: "approved" as const,
                suspensionDays: undefined,
                suspendedUntil: undefined,
                suspensionReason: undefined,
                blockReason: undefined,
              }
            : req
        )
      );
      toast.success("Creator account restored.");
    } catch (e: any) {
      toast.error(e.message || "Failed to revoke restriction");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400";
      case "rejected":
        return "bg-red-500/20 text-red-400";
      case "suspended":
        return "bg-orange-500/20 text-orange-400";
      case "blocked":
        return "bg-rose-600/20 text-rose-400";
      case "pending":
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      case "suspended":
        return <ShieldAlert className="w-4 h-4" />;
      case "blocked":
        return <ShieldBan className="w-4 h-4" />;
      case "pending":
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const socialIcons = {
    instagram: Instagram,
    youtube: Youtube,
    x: XIcon,
    linkedin: Linkedin,
    website: Globe,
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">AI Creator Requests</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and manage user requests to become AI creators
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4 animate-pulse" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Loading...</h2>
          </div>
        ) : error ? (
          <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Users className="w-12 h-12 text-red-400 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Error</h2>
            <p className="text-muted-foreground text-sm max-w-md">{error}</p>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="glass-card rounded-xl p-5 transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{request.name}</h3>
                      <Badge variant="secondary" className={`gap-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">@{request.username}</p>
                    <p className="text-sm text-muted-foreground mb-1"><b>Email:</b> {request.email}</p>
                    <p className="text-sm text-muted-foreground mb-1"><b>Mobile:</b> {request.mobile}</p>
                    <p className="text-sm text-muted-foreground mb-1"><b>Date of Birth:</b> {request.dob}</p>
                    {/* Social Media Icons */}
                    <div className="flex gap-2 mb-2">
                      {Object.entries(socialIcons).map(([key, Icon]) =>
                        request[key] ? (
                          <a
                            key={key}
                            href={request[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={key.charAt(0).toUpperCase() + key.slice(1)}
                            className="text-primary hover:text-blue-500"
                          >
                            <Icon className="w-5 h-5" />
                          </a>
                        ) : null
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1"><b>Bio:</b> {request.instagram}</p>
                    <p className="text-sm text-muted-foreground mb-1"><b>Experience:</b> {request.youtube}</p>
                    {request.reason && (
                      <p className="text-sm text-muted-foreground mb-1"><b>Reason:</b> {request.reason}</p>
                    )}
                    {request.status === "suspended" && (
                      <p className="text-sm text-orange-400 mb-1">
                        <b>Suspended:</b> {request.suspensionDays || "-"} day(s)
                        {request.suspendedUntil ? ` (until ${new Date(request.suspendedUntil).toLocaleDateString()})` : ""}
                      </p>
                    )}
                    {request.status === "blocked" && (
                      <p className="text-sm text-rose-400 mb-1"><b>Blocked:</b> {request.blockReason || "Illegal activity"}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-3">
                      Submitted {request.submittedAt.toLocaleDateString()}
                    </p>
                    {/* Show status after approval/rejection */}
                    {request.status !== "pending" && (
                      <div className="mt-2">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>
                  {request.status === "pending" && (
                    <div className="flex gap-2 sm:flex-col">
                      <Button
                        onClick={() => handleApprove(request.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(request.id)}
                        size="sm"
                        variant="destructive"
                      >
                        Reject
                      </Button>
                    </div>
                  )}

                  {(request.status === "approved" || request.status === "suspended" || request.status === "blocked") && (
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" className="h-9 w-9">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => openSuspendDialog(request.id)}>
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Suspend
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openBlockDialog(request.id)}>
                            <ShieldBan className="w-4 h-4 mr-2" />
                            Block
                          </DropdownMenuItem>
                          {request.status === "suspended" && (
                            <DropdownMenuItem onClick={() => handleRevoke(request.id)}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Revoke
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No requests found" : "No AI creator requests"}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md">
              {searchQuery
                ? "Try a different search term"
                : "AI creator requests from users will appear here"}
            </p>
          </div>
        )}

        <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
          <DialogContent className="sm:max-w-md border-orange-500/40 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-orange-300">Suspend AI Creator</DialogTitle>
              <DialogDescription className="text-zinc-300">
                Set suspension days and reason. This creator will lose AI Creator access until suspension ends.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wide text-orange-200/80">Suspension Days</label>
                <Input
                  type="number"
                  min={1}
                  value={suspendDays}
                  onChange={(e) => setSuspendDays(e.target.value)}
                  className="bg-zinc-900/70 border-orange-500/30 focus-visible:ring-orange-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-wide text-orange-200/80">Reason</label>
                <Textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  className="min-h-[88px] bg-zinc-900/70 border-orange-500/30 focus-visible:ring-orange-400"
                  placeholder="Reason for suspension"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setSuspendDialogOpen(false)}
                className="border-zinc-600 text-zinc-200 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitSuspend}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400"
              >
                Suspend Creator
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
          <DialogContent className="sm:max-w-md border-orange-500/40 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 text-zinc-100">
            <DialogHeader>
              <DialogTitle className="text-orange-300">Block AI Creator Permanently</DialogTitle>
              <DialogDescription className="text-zinc-300">
                Blocking is permanent for AI Creator features. Same email or mobile cannot re-register as AI Creator.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5">
              <label className="text-xs uppercase tracking-wide text-orange-200/80">Reason</label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="min-h-[88px] bg-zinc-900/70 border-orange-500/30 focus-visible:ring-orange-400"
                placeholder="Reason for permanent block"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBlockDialogOpen(false)}
                className="border-zinc-600 text-zinc-200 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={submitBlock}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400"
              >
                Confirm Block
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AICreatorRequests;
