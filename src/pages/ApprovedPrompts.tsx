import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PromptRequestList } from "@/components/admin/PromptRequestList";
import { PromptPreview } from "@/components/admin/PromptPreview";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { PromptRequest } from "@/types/prompt";
import { toast } from "sonner";

const ApprovedPrompts = () => {
  const [requests, setRequests] = useState<PromptRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingPayoutId, setUpdatingPayoutId] = useState<string | null>(null);
  const [updatingBurnCreditsId, setUpdatingBurnCreditsId] = useState<string | null>(null);

  const API_URL = "http://127.0.0.1:8000/admin/ai-creator/prompts";

  const normalizeStatus = (value: string): PromptRequest["status"] => {
    const normalized = (value || "").toLowerCase();
    if (normalized === "modified" || normalized === "modify") return "modified";
    if (normalized === "approved") return "approved";
    if (normalized === "rejected") return "rejected";
    if (normalized === "delete_requested") return "delete_requested";
    if (normalized === "deleted") return "deleted";
    return "pending";
  };

  const selectedRequest = requests.find((r) => r.id === selectedId) || null;

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_URL}?status=approved`);
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
          reason: p.reason,
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
      } catch (e: any) {
        setError(e.message || "Failed to load prompts");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleUpdatePayout = async (id: string, payoutPerRemix: number) => {
    try {
      setUpdatingPayoutId(id);
      const res = await fetch(`${API_URL}/${id}/payout`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payout_per_remix: payoutPerRemix }),
      });
      if (!res.ok) throw new Error("Failed to update payout");

      setRequests((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const remixes = r.remixesCount ?? 0;
          return {
            ...r,
            payoutPerRemix,
            totalEarnings: remixes * payoutPerRemix,
          };
        })
      );
      toast.success(`Updated payout to Rs ${payoutPerRemix} per remix`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update payout");
    } finally {
      setUpdatingPayoutId(null);
    }
  };

  const handleUpdateBurnCredits = async (id: string, burnCredits: number) => {
    try {
      setUpdatingBurnCreditsId(id);
      const res = await fetch(`${API_URL}/${id}/burn-credits`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ burn_credits: burnCredits }),
      });
      if (!res.ok) throw new Error("Failed to update burn credits");

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                burnCredits,
              }
            : r
        )
      );
      toast.success(`Updated burn credits to ${burnCredits}`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update burn credits");
    } finally {
      setUpdatingBurnCreditsId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-0px)] flex flex-col">
        <div className="p-6 border-b border-border shrink-0">
          <h1 className="text-2xl font-display font-bold text-foreground">Approved Prompts</h1>
          <p className="text-sm text-muted-foreground">
            All approved prompts with stats and creator details.
          </p>
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
                requests={requests}
                selectedId={selectedId}
                onSelect={setSelectedId}
                subtitle={`${requests.length} approved`}
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={75}>
              <PromptPreview
                request={selectedRequest}
                onAccept={() => undefined}
                onReject={() => undefined}
                onModify={() => undefined}
                onUpdatePayout={handleUpdatePayout}
                updatingPayout={updatingPayoutId === selectedRequest?.id}
                onUpdateBurnCredits={handleUpdateBurnCredits}
                updatingBurnCredits={updatingBurnCreditsId === selectedRequest?.id}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ApprovedPrompts;
