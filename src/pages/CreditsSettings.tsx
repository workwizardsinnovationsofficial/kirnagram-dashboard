import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Coins, Sparkles, ShieldCheck } from "lucide-react";
import { fetchCreditSettings, updateCreditSettings, CreditSettings } from "@/lib/creditsApi";
import { toast } from "sonner";

const formatAmount = (value: number) => `${value.toLocaleString()}`;

const defaultSettings: CreditSettings = {
  welcome_bonus_enabled: true,
  welcome_bonus_credits: 10,
  welcome_bonus_valid_days: 1,
  daily_ad_enabled: true,
  daily_ad_credits: 2,
  daily_ad_limit: 1,
  paid_plans: Array.from({ length: 7 }).map((_, index) => ({
    id: `plan_${index + 1}`,
    name: `Plan ${index + 1}`,
    credits: 0,
    price: 0,
    description: ["", "", "", ""],
  })),
  burn_rates: {
    chatgpt: { low: 2, medium: 4, high: 6 },
    gemini: { fast: 2, standard: 4, ultra: 6 },
  },
  model_enabled: { chatgpt: true, gemini: true },
};

const CreditsSettings = () => {
  const [settings, setSettings] = useState<CreditSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchCreditSettings();
        setSettings({ ...defaultSettings, ...data });
      } catch (error) {
        toast.error("Failed to load credit settings");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const paidPlans = useMemo(() => settings.paid_plans ?? [], [settings.paid_plans]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<CreditSettings> = {
        welcome_bonus_enabled: settings.welcome_bonus_enabled,
        welcome_bonus_credits: settings.welcome_bonus_credits,
        welcome_bonus_valid_days: settings.welcome_bonus_valid_days,
        daily_ad_enabled: settings.daily_ad_enabled,
        daily_ad_credits: settings.daily_ad_credits,
        daily_ad_limit: settings.daily_ad_limit,
        paid_plans: settings.paid_plans,
        burn_rates: settings.burn_rates,
        model_enabled: settings.model_enabled,
      };
      const updated = await updateCreditSettings(payload);
      setSettings({ ...settings, ...updated });
      toast.success("Credits settings updated");
    } catch (error) {
      toast.error("Failed to update credit settings");
    } finally {
      setSaving(false);
    }
  };

  const updatePaidPlan = (index: number, field: "name" | "credits" | "price" | "description", value: string, descIndex?: number) => {
    setSettings((prev) => {
      const nextPlans = [...prev.paid_plans];
      const target = { ...nextPlans[index] } as any;
      if (field === "credits") {
        const n = Math.max(0, Number(value) || 0);
        target.credits = n;
      } else if (field === "price") {
        const n = Math.max(0, Number(value) || 0);
        target.price = n;
      } else if (field === "description" && typeof descIndex === "number") {
        const desc = Array.isArray(target.description) ? [...target.description] : ["", "", "", ""];
        desc[descIndex] = value;
        target.description = desc;
      } else if (field === "name") {
        target.name = value;
      }
      nextPlans[index] = target;
      return { ...prev, paid_plans: nextPlans };
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Credits Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Control free credits and paid plans.
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Welcome Bonus</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable welcome bonus</p>
                <p className="text-xs text-muted-foreground">Only for new users within valid days.</p>
              </div>
              <Switch
                checked={settings.welcome_bonus_enabled}
                onCheckedChange={(value) =>
                  setSettings((prev) => ({ ...prev, welcome_bonus_enabled: value }))
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Credits</Label>
                <Input
                  type="number"
                  value={settings.welcome_bonus_credits}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      welcome_bonus_credits: Number(event.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Valid days</Label>
                <Input
                  type="number"
                  value={settings.welcome_bonus_valid_days}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      welcome_bonus_valid_days: Number(event.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="font-display font-semibold text-foreground">Daily Ad Claim</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Enable daily ad credits</p>
                <p className="text-xs text-muted-foreground">Limit claims once per 24h.</p>
              </div>
              <Switch
                checked={settings.daily_ad_enabled}
                onCheckedChange={(value) =>
                  setSettings((prev) => ({ ...prev, daily_ad_enabled: value }))
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Credits per claim</Label>
                <Input
                  type="number"
                  value={settings.daily_ad_credits}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      daily_ad_credits: Number(event.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Limit per day</Label>
                <Input
                  type="number"
                  value={settings.daily_ad_limit}
                  onChange={(event) =>
                    setSettings((prev) => ({
                      ...prev,
                      daily_ad_limit: Number(event.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
          </Card>
        </div>

        <Card className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-display font-semibold text-foreground">Paid Plans</h2>
              <p className="text-xs text-muted-foreground">Credits add instantly after payment.</p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr">
            {paidPlans.map((plan, index) => (
              <div key={plan.id} className="rounded-xl border border-border/70 p-4 bg-background/60 shadow-sm h-full ring-1 ring-white/5 hover:shadow-md overflow-hidden">
                <div className="space-y-2">
                  <Label>Plan name</Label>
                  <Input className="text-center" value={plan.name} onChange={(event) => updatePaidPlan(index, "name", event.target.value)} />
                </div>
                <div className="space-y-2 mt-3">
                  <Label>Credits</Label>
                  <Input
                    type="number"
                    min={0}
                    className="text-center"
                    value={plan.credits}
                    onChange={(event) => updatePaidPlan(index, "credits", event.target.value)}
                  />
                </div>
                <div className="space-y-2 mt-3">
                  <Label>Price (INR)</Label>
                  <Input
                    type="number"
                    min={0}
                    className="text-center"
                    value={(plan as any).price ?? 0}
                    onChange={(event) => updatePaidPlan(index, "price", event.target.value)}
                  />
                </div>
                <div className="space-y-2 mt-3">
                  <Label>Description (4 points)</Label>
                  <div className="grid gap-2">
                    {Array.from({ length: 4 }).map((_, di) => (
                      <Input
                        key={di}
                        value={((plan as any).description && (plan as any).description[di]) || ""}
                        onChange={(event) => updatePaidPlan(index, "description", event.target.value, di)}
                        placeholder={`Point ${di + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreditsSettings;
