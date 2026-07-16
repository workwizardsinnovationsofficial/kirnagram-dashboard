const API_BASE = "http://127.0.0.1:8000";

export type CreditSettings = {
  _id?: string;
  welcome_bonus_enabled: boolean;
  welcome_bonus_credits: number;
  welcome_bonus_valid_days: number;
  daily_ad_enabled: boolean;
  daily_ad_credits: number;
  daily_ad_limit: number;
  paid_plans: Array<{ id: string; name: string; credits: number; price?: number; description?: string[] }>;
  burn_rates: {
    chatgpt: { low: number; medium: number; high: number };
    gemini: { fast: number; standard: number; ultra: number };
  };
  model_enabled: { chatgpt: boolean; gemini: boolean };
};

export const fetchCreditSettings = async (): Promise<CreditSettings> => {
  const res = await fetch(`${API_BASE}/admin/credits/settings`);
  if (!res.ok) throw new Error("Failed to load credit settings");
  return res.json();
};

export const updateCreditSettings = async (payload: Partial<CreditSettings>): Promise<CreditSettings> => {
  const res = await fetch(`${API_BASE}/admin/credits/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update credit settings");
  return res.json();
};
