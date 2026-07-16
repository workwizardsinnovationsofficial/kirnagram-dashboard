const API_BASE = "http://127.0.0.1:8000";

export type PublisherApplicationStatus = "pending" | "approved" | "rejected";

export type PublisherApplication = {
  _id: string;
  user_id: string;
  status: PublisherApplicationStatus;
  created_at?: string | null;
  updated_at?: string | null;
  reviewed_at?: string | null;
  admin_note?: string | null;
  user: {
    firebase_uid?: string;
    username?: string;
    full_name?: string;
    email?: string;
    mobile?: string;
    image_name?: string;
  };
  application: {
    full_name?: string;
    business_name?: string;
    business_type?: string;
    target_audience?: string;
  };
};

export type AdminCampaign = {
  _id: string;
  publisher_id: string;
  ad_name: string;
  business_name?: string;
  website_url?: string;
  status: string;
  days_left: number;
  home_enabled?: boolean;
  home_banner_enabled?: boolean;
  discover_banner_enabled?: boolean;
  claims_banner_enabled?: boolean;
  feed_inline_enabled?: boolean;
  created_at?: string | null;
  metrics: {
    views: number;
    detail_clicks: number;
  };
  publisher?: {
    full_name?: string;
    username?: string;
    email?: string;
  };
};

export const fetchPublisherApplications = async (
  status: "all" | PublisherApplicationStatus = "all",
): Promise<PublisherApplication[]> => {
  const res = await fetch(`${API_BASE}/admin/ads/publisher-applications?status=${status}`);
  if (!res.ok) throw new Error("Failed to fetch publisher applications");
  return res.json();
};

export const updatePublisherApplicationStatus = async (
  applicationId: string,
  status: "approved" | "rejected",
  adminNote?: string,
): Promise<{ success: boolean; application_id: string; status: PublisherApplicationStatus }> => {
  const res = await fetch(`${API_BASE}/admin/ads/publisher-applications/${applicationId}/status`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, admin_note: adminNote || null }),
  });

  if (!res.ok) throw new Error("Failed to update application status");
  return res.json();
};

export const fetchAllCampaignsForAdmin = async (): Promise<AdminCampaign[]> => {
  const res = await fetch(`${API_BASE}/admin/ads/campaigns`);
  if (!res.ok) throw new Error("Failed to fetch campaigns");
  return res.json();
};

export const updateCampaignHomeVisibility = async (
  campaignId: string,
  enabled: boolean,
): Promise<{ success: boolean; campaign: AdminCampaign }> => {
  const res = await fetch(`${API_BASE}/admin/ads/campaigns/${campaignId}/home-visibility`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });

  if (!res.ok) throw new Error("Failed to update campaign visibility");
  return res.json();
};

export const updateCampaignPlacements = async (
  campaignId: string,
  payload: {
    home_banner_enabled?: boolean;
    discover_banner_enabled?: boolean;
    claims_banner_enabled?: boolean;
    feed_inline_enabled?: boolean;
  },
): Promise<{ success: boolean; campaign: AdminCampaign }> => {
  const res = await fetch(`${API_BASE}/admin/ads/campaigns/${campaignId}/placements`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update campaign placements");
  return res.json();
};
