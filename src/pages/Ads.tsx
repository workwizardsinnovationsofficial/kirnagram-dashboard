import { AdminLayout } from "@/components/admin/AdminLayout";
import { useEffect, useMemo, useState } from "react";
import { Megaphone, Mail, Phone, User, Building2, Tag, Users } from "lucide-react";
import {
  AdminCampaign,
  fetchAllCampaignsForAdmin,
  fetchPublisherApplications,
  PublisherApplication,
  updateCampaignPlacements,
  updatePublisherApplicationStatus,
} from "@/lib/adsApi";
import { Button } from "@/components/ui/button";

const Ads = () => {
  const [activeTab, setActiveTab] = useState<"applications" | "central">("applications");
  const [requests, setRequests] = useState<PublisherApplication[]>([]);
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublisherApplications("all");
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllCampaignsForAdmin();
      setCampaigns(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  };

  const pendingRequests = useMemo(
    () => requests.filter((r) => r.status === "pending"),
    [requests],
  );
  const reviewedRequests = useMemo(
    () => requests.filter((r) => r.status !== "pending"),
    [requests],
  );

  const handleDecision = async (id: string, status: "approved" | "rejected") => {
    try {
      setProcessingId(id);
      await updatePublisherApplicationStatus(id, status);
      await loadRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleTogglePlacement = async (
    campaign: AdminCampaign,
    key: "home_banner_enabled" | "discover_banner_enabled" | "claims_banner_enabled" | "feed_inline_enabled",
  ) => {
    try {
      setProcessingId(campaign._id);
      const current = Boolean(campaign[key]);
      const next = !current;
      await updateCampaignPlacements(campaign._id, { [key]: next });
      setCampaigns((prev) =>
        prev.map((item) =>
          item._id === campaign._id
            ? {
                ...item,
                [key]: next,
                ...(key === "home_banner_enabled" ? { home_enabled: next } : {}),
              }
            : item
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update visibility");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Ads
          </h1>
          <p className="text-muted-foreground">
            Review publisher applications and manage platform-wide campaign visibility.
          </p>
          <div className="mt-4 flex gap-2">
            <Button
              variant={activeTab === "applications" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("applications");
                loadRequests();
              }}
            >
              Publisher Applications
            </Button>
            <Button
              variant={activeTab === "central" ? "default" : "outline"}
              onClick={() => {
                setActiveTab("central");
                loadCampaigns();
              }}
            >
              Central Ads Management
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Megaphone className="w-16 h-16 text-muted-foreground mb-4 animate-pulse" />
            <h2 className="text-xl font-display font-semibold text-foreground mb-2">
              Loading data...
            </h2>
          </div>
        ) : activeTab === "applications" ? (
          <div className="space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Pending Requests ({pendingRequests.length})
                </h2>
              </div>
              {pendingRequests.length === 0 ? (
                <div className="glass-card rounded-xl p-10 text-center text-muted-foreground">
                  No pending requests.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {pendingRequests.map((request) => (
                    <div key={request._id} className="glass-card rounded-xl p-5 space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">User Details</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="flex items-center gap-2"><User className="w-4 h-4" /> {request.user.full_name || request.application.full_name || "-"}</p>
                          <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {request.user.email || "-"}</p>
                          <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {request.user.mobile || "-"}</p>
                          <p className="flex items-center gap-2"><User className="w-4 h-4" /> @{request.user.username || "-"}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Application Details</p>
                        <div className="mt-2 space-y-1 text-sm">
                          <p className="flex items-center gap-2"><Building2 className="w-4 h-4" /> {request.application.business_name || "-"}</p>
                          <p className="flex items-center gap-2"><Tag className="w-4 h-4" /> {request.application.business_type || "-"}</p>
                          <p className="flex items-center gap-2"><Users className="w-4 h-4" /> {request.application.target_audience || "-"}</p>
                          <p className="text-xs text-muted-foreground pt-1">
                            Submitted: {request.created_at ? new Date(request.created_at).toLocaleString() : "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDecision(request._id, "approved")}
                          disabled={processingId === request._id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDecision(request._id, "rejected")}
                          disabled={processingId === request._id}
                          variant="destructive"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-display font-semibold text-foreground">
                  Reviewed Requests ({reviewedRequests.length})
                </h2>
              </div>
              {reviewedRequests.length === 0 ? (
                <div className="glass-card rounded-xl p-10 text-center text-muted-foreground">
                  No reviewed requests yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {reviewedRequests.map((request) => (
                    <div key={request._id} className="glass-card rounded-xl p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{request.application.business_name || request.user.full_name || "Request"}</h3>
                        <span className={request.status === "approved" ? "text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400" : "text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400"}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Applicant: {request.user.full_name || request.application.full_name || "-"} ({request.user.email || "-"})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Business Type: {request.application.business_type || "-"} | Target: {request.application.target_audience || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Reviewed: {request.reviewed_at ? new Date(request.reviewed_at).toLocaleString() : "-"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-display font-semibold text-foreground">
                All Published Ads ({campaigns.length})
              </h2>
            </div>

            {campaigns.length === 0 ? (
              <div className="glass-card rounded-xl p-10 text-center text-muted-foreground">
                No campaigns found.
              </div>
            ) : (
              <div className="glass-card rounded-xl overflow-x-auto">
                <table className="w-full min-w-[980px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left px-4 py-3">Ad</th>
                      <th className="text-left px-4 py-3">Business</th>
                      <th className="text-left px-4 py-3">Publisher</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="text-left px-4 py-3">Days Left</th>
                      <th className="text-left px-4 py-3">Views</th>
                      <th className="text-left px-4 py-3">Clicks</th>
                      <th className="text-left px-4 py-3">Home Banner</th>
                      <th className="text-left px-4 py-3">Discover Spotlight</th>
                      <th className="text-left px-4 py-3">Claims Banner</th>
                      <th className="text-left px-4 py-3">Feed Inline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((campaign) => (
                      <tr key={campaign._id} className="border-b border-border/60">
                        <td className="px-4 py-3 font-medium">{campaign.ad_name}</td>
                        <td className="px-4 py-3">{campaign.business_name || "N/A"}</td>
                        <td className="px-4 py-3">
                          {campaign.publisher?.full_name || campaign.publisher?.username || campaign.publisher_id}
                        </td>
                        <td className="px-4 py-3">{campaign.status}</td>
                        <td className="px-4 py-3">{campaign.days_left}</td>
                        <td className="px-4 py-3">{campaign.metrics?.views || 0}</td>
                        <td className="px-4 py-3">{campaign.metrics?.detail_clicks || 0}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleTogglePlacement(campaign, "home_banner_enabled")}
                            disabled={processingId === campaign._id}
                            className={campaign.home_banner_enabled || campaign.home_enabled ? "px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40" : "px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border"}
                          >
                            {processingId === campaign._id ? "Updating..." : campaign.home_banner_enabled || campaign.home_enabled ? "ON" : "OFF"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleTogglePlacement(campaign, "discover_banner_enabled")}
                            disabled={processingId === campaign._id}
                            className={campaign.discover_banner_enabled ? "px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40" : "px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border"}
                          >
                            {processingId === campaign._id ? "Updating..." : campaign.discover_banner_enabled ? "ON" : "OFF"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleTogglePlacement(campaign, "claims_banner_enabled")}
                            disabled={processingId === campaign._id}
                            className={campaign.claims_banner_enabled ? "px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40" : "px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border"}
                          >
                            {processingId === campaign._id ? "Updating..." : campaign.claims_banner_enabled ? "ON" : "OFF"}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleTogglePlacement(campaign, "feed_inline_enabled")}
                            disabled={processingId === campaign._id}
                            className={campaign.feed_inline_enabled ? "px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/40" : "px-3 py-1.5 rounded-full bg-muted text-muted-foreground border border-border"}
                          >
                            {processingId === campaign._id ? "Updating..." : campaign.feed_inline_enabled ? "ON" : "OFF"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </div>
    </AdminLayout>
  );
};

export default Ads;
