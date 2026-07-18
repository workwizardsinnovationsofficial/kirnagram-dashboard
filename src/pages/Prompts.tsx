import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PromptRequestList } from "@/components/admin/PromptRequestList";
import { PromptPreview } from "@/components/admin/PromptPreview";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PromptRequest } from "@/types/prompt";
import { toast } from "sonner";

const Prompts = () => {
  const [requests, setRequests] = useState<PromptRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewFilter, setViewFilter] = useState<"all" | "pending" | "delete_requested">("all");

  const API_URL = "http://localhost:8000/admin/ai-creator/prompts";

  const normalizeStatus = (value: string): PromptRequest["status"] => {
    const normalized = (value || "").toLowerCase();
    if (normalized === "modified" || normalized === "modify") return "modified";
    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "rejected";
    if (normalized === "delete_requested") return "delete_requested";
    if (normalized === "deleted") return "deleted";
    return "pending";
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}?status=pending`);
        if (!res.ok) throw new Error("Failed to fetch prompts");
        const data = await res.json();
        const mapped: PromptRequest[] = (Array.isArray(data) ? data : []).map((p: any) => ({
          id: p._id,
          unitId: p.unit_id,
          userId: p.user_id,
          creatorName: p.creator_contact?.full_name || p.user?.full_name || p.user?.username || "Creator",
          creatorUsername: p.user?.username,
          creatorEmail: p.creator_contact?.email,
          creatorMobile: p.creator_contact?.mobile,
          creatorDob: p.creator_contact?.dob,
          title: p.style_name,
          promptDescription: p.prompt_description || "",
          promptTemplate: p.prompt_template || "",
          promptVariables: Array.isArray(p.prompt_variables) ? p.prompt_variables : [],
          aiModel: p.ai_model,
          promptCategory: p.prompt_category || "",
          aspectRatio: p.aspect_ratio || "",
          requireReferenceImage: Boolean(p.require_reference_image),
          sampleImageUrls: Array.isArray(p.sample_image_urls) ? p.sample_image_urls : [],
          referenceCorrectImageUrls: Array.isArray(p.reference_correct_image_urls) ? p.reference_correct_image_urls : [],
          referenceWrongImageUrls: Array.isArray(p.reference_wrong_image_urls) ? p.reference_wrong_image_urls : [],
          tags: p.tags || [],
          submittedAt: p.created_at ? new Date(p.created_at) : new Date(),
          status: normalizeStatus(p.status),
          reason: p.delete_request_reason || p.reason,
          previewImage: p.image_url,
          likesCount: Array.isArray(p.likes) ? p.likes.length : p.likes_count || 0,
          viewsCount: Array.isArray(p.views) ? p.views.length : p.views_count || 0,
          commentsCount: Array.isArray(p.comments) ? p.comments.length : p.comments_count || 0,
          remixesCount: Array.isArray(p.remixes) ? p.remixes.length : p.remixes_count || 0,
          payoutPerRemix: Number(p.payout_per_remix ?? 1),
          burnCredits: Number(p.burn_credits ?? 3),
          totalEarnings: (Array.isArray(p.remixes) ? p.remixes.length : p.remixes_count || 0) * Number(p.payout_per_remix ?? 1),
        }));
        setRequests(mapped);
        setSelectedId((prev) => prev || mapped[0]?.id || null);
      } catch (e: any) {
        setError(e.message || "Failed to load prompts");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleAccept = async (id: string) => {
    try {
      const request = requests.find((item) => item.id === id);
      const endpoint = request?.status === "delete_requested"
        ? `${API_URL}/${id}/delete/approve`
        : `${API_URL}/${id}/approve`;
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) throw new Error("Failed to approve");
      setRequests((prev) => {
        const next = prev.filter((r) => r.id !== id);
        setSelectedId(next[0]?.id || null);
        return next;
      });
      toast.success(request?.status === "delete_requested"
        ? "Delete request approved. Prompt post removed from live feed."
        : "Prompt accepted and published live!");
    } catch (e: any) {
      toast.error(e.message || "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const request = requests.find((item) => item.id === id);
      const reason = window.prompt("Rejection reason (optional)") || "";
      const base = request?.status === "delete_requested"
        ? `${API_URL}/${id}/delete/reject`
        : `${API_URL}/${id}/reject`;
      const url = reason ? `${base}?reason=${encodeURIComponent(reason)}` : base;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Failed to reject");
      setRequests((prev) => {
        const next = prev.filter((r) => r.id !== id);
        setSelectedId(next[0]?.id || null);
        return next;
      });
      toast.error(request?.status === "delete_requested"
        ? "Delete request rejected. Creator was notified to contact customer care."
        : "Prompt has been rejected.");
    } catch (e: any) {
      toast.error(e.message || "Failed to reject");
    }
  };

  const handleModify = async (id: string) => {
    try {
      const request = requests.find((item) => item.id === id);
      if (request?.status === "delete_requested") {
        toast.info("Delete requests can only be approved or rejected.");
        return;
      }
      const reason = window.prompt("Modification reason (optional)") || "";
      const url = reason ? `${API_URL}/${id}/modify?reason=${encodeURIComponent(reason)}` : `${API_URL}/${id}/modify`;
      const res = await fetch(url, { method: "POST" });
      if (!res.ok) throw new Error("Failed to request modification");
      setRequests((prev) => {
        const next = prev.filter((r) => r.id !== id);
        setSelectedId(next[0]?.id || null);
        return next;
      });
      toast.info("Modification request sent to creator.");
    } catch (e: any) {
      toast.error(e.message || "Failed to request modification");
    }
  };

  const filteredRequests = requests.filter((request) => {
    if (viewFilter === "all") return true;
    if (viewFilter === "delete_requested") return request.status === "delete_requested";
    return request.status === "pending" || request.status === "modified" || request.status === "modify";
  });

  useEffect(() => {
    if (filteredRequests.length === 0) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }

    const existsInFilter = filteredRequests.some((request) => request.id === selectedId);
    if (!existsInFilter) {
      setSelectedId(filteredRequests[0].id);
    }
  }, [filteredRequests, selectedId]);

  const selectedRequest = filteredRequests.find((r) => r.id === selectedId) || null;

  const pendingCount = requests.filter((r) => r.status === "pending" || r.status === "modified" || r.status === "modify").length;
  const deleteRequestCount = requests.filter((r) => r.status === "delete_requested").length;

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-0px)] flex flex-col">
        <div className="p-6 border-b border-border shrink-0">
          <h1 className="text-2xl font-display font-bold text-foreground">Prompts</h1>
          <p className="text-sm text-muted-foreground">
            Review and manage creator prompt submissions.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setViewFilter("all")}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${viewFilter === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border"}`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setViewFilter("pending")}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${viewFilter === "pending" ? "bg-primary text-primary-foreground border-primary" : "bg-transparent text-muted-foreground border-border"}`}
            >
              New/Modify ({pendingCount})
            </button>
            <button
              onClick={() => setViewFilter("delete_requested")}
              className={`rounded-full px-3 py-1 text-xs font-medium border ${viewFilter === "delete_requested" ? "bg-red-600 text-white border-red-600" : "bg-transparent text-red-400 border-red-500/40"}`}
            >
              Delete Requests ({deleteRequestCount})
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          {loading && (
            <div className="p-6 text-sm text-muted-foreground">Loading prompts...</div>
          )}
          {error && !loading && (
            <div className="p-6 text-sm text-red-500">{error}</div>
          )}
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
              <PromptRequestList
                requests={filteredRequests}
                selectedId={selectedId}
                onSelect={setSelectedId}
                subtitle={`${filteredRequests.length} showing`}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={75}>
              <PromptPreview
                request={selectedRequest}
                onAccept={handleAccept}
                onReject={handleReject}
                onModify={handleModify}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Prompts;
