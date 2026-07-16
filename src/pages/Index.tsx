import { useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { MetricChip } from "@/components/admin/MetricChip";
import { MetricStatsBar } from "@/components/admin/MetricStatsBar";
import { UnifiedChart } from "@/components/admin/UnifiedChart";
import { TrafficChart } from "@/components/admin/TrafficChart";
import { TrafficUsersTable } from "@/components/admin/TrafficUsersTable";
import { TimelineFilter, TimelinePreset } from "@/components/admin/TimelineFilter";
import { UsersDetailsTable, NormalUserRow, AICreatorUserRow } from "../components/admin/UsersDetailsTable";
import {
  Heart,
  MessageCircle,
  Share2,
  Upload,
  CheckCircle,
  XCircle,
  Edit,
  ArrowDownCircle,
  Users,
} from "lucide-react";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const MAX_SELECTIONS = 5;

interface MetricConfig {
  id: string;
  title: string;
  value: string | number;
  change: number;
  icon: ReactNode;
  lineColor: string;
}

interface AnalyticsPoint {
  [key: string]: string | number;
  period: string;
  likes: number;
  comments: number;
  shares: number;
  posts: number;
  editPrompts: number;
  acceptedPrompts: number;
  rejectedPrompts: number;
  withdrawRequests: number;
  totalUsers: number;
}

interface TrafficUserRow {
  user_id: string;
  name: string;
  username: string;
  email: string;
  mobile: string;
  user_type: "normal" | "ai_creator";
  first_seen_at?: string;
  last_seen_at?: string;
  time_used_seconds: number;
  time_used_minutes: number;
  hit_count: number;
  last_path: string;
}

interface DailyTrafficHistoryRow {
  date: string;
  active_users: number;
  total_hits: number;
  total_time_minutes: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

const metricIcons: Record<string, ReactNode> = {
  likes: <Heart className="w-4 h-4" />,
  comments: <MessageCircle className="w-4 h-4" />,
  shares: <Share2 className="w-4 h-4" />,
  posts: <Upload className="w-4 h-4" />,
  editPrompts: <Edit className="w-4 h-4" />,
  acceptedPrompts: <CheckCircle className="w-4 h-4" />,
  rejectedPrompts: <XCircle className="w-4 h-4" />,
  withdrawRequests: <ArrowDownCircle className="w-4 h-4" />,
  totalUsers: <Users className="w-4 h-4" />,
};

const metricColors: Record<string, string> = {
  likes: "#f43f5e",
  comments: "#8b5cf6",
  shares: "#06b6d4",
  posts: "#f97316",
  editPrompts: "#eab308",
  acceptedPrompts: "#22c55e",
  rejectedPrompts: "#ef4444",
  withdrawRequests: "#64748b",
  totalUsers: "#3b82f6",
};

const metricTitles: Record<string, string> = {
  likes: "Likes",
  comments: "Comments",
  shares: "Shares",
  posts: "Posts",
  editPrompts: "Edit Prompt Count",
  acceptedPrompts: "Accepted Prompt Count",
  rejectedPrompts: "Rejected Prompt Count",
  withdrawRequests: "Withdraw Requests",
  totalUsers: "Total Users",
};

const metricOrder = [
  "likes",
  "comments",
  "shares",
  "posts",
  "editPrompts",
  "acceptedPrompts",
  "rejectedPrompts",
  "withdrawRequests",
  "totalUsers",
];

const defaultMetrics = {
  likes: 0,
  comments: 0,
  shares: 0,
  posts: 0,
  editPrompts: 0,
  acceptedPrompts: 0,
  rejectedPrompts: 0,
  withdrawRequests: 0,
  totalUsers: 0,
};

const Index = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [timelinePreset, setTimelinePreset] = useState<TimelinePreset>("30days");
  const [timelineRange, setTimelineRange] = useState<DateRange | null>(null);

  const [metrics, setMetrics] = useState<Record<string, number>>(defaultMetrics);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsPoint[]>([]);
  const [trafficData, setTrafficData] = useState<{ hour: string; traffic: number }[]>([]);
  const [trafficUsersToday, setTrafficUsersToday] = useState<TrafficUserRow[]>([]);
  const [trafficHistory, setTrafficHistory] = useState<DailyTrafficHistoryRow[]>([]);
  const [normalUsersRows, setNormalUsersRows] = useState<NormalUserRow[]>([]);
  const [aiCreatorUsersRows, setAiCreatorUsersRows] = useState<AICreatorUserRow[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);

  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingTraffic, setLoadingTraffic] = useState(false);
  const [loadingTrafficUsers, setLoadingTrafficUsers] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const resolveRangeForApi = (preset: TimelinePreset): string => {
    if (preset === "live") return "today";
    return preset;
  };

  const loadDashboardData = useCallback(async (preset: TimelinePreset, rangeValue?: DateRange | null) => {
    const range = resolveRangeForApi(preset);
    const params = new URLSearchParams({ range });

    if (preset === "custom" && rangeValue?.from && rangeValue?.to) {
      params.set("start_date", rangeValue.from.toISOString());
      params.set("end_date", rangeValue.to.toISOString());
    }

    const query = params.toString();

    try {
      setLoadingMetrics(true);
      setLoadingAnalytics(true);
      setLoadingTraffic(true);
      setLoadingTrafficUsers(true);
      setLoadingUsers(true);

      const [metricsRes, analyticsRes, trafficRes, trafficUsersRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/dashboard/metrics?${query}`),
        fetch(`${API_BASE}/admin/dashboard/analytics?${query}`),
        fetch(`${API_BASE}/admin/dashboard/traffic?${query}`),
        fetch(`${API_BASE}/admin/dashboard/traffic-users?${query}`),
        fetch(`${API_BASE}/admin/dashboard/users?${query}`),
      ]);

      if (!metricsRes.ok) throw new Error("Failed to load metrics");
      if (!analyticsRes.ok) throw new Error("Failed to load analytics");
      if (!trafficRes.ok) throw new Error("Failed to load traffic");
      if (!trafficUsersRes.ok) throw new Error("Failed to load traffic users");
      if (!usersRes.ok) throw new Error("Failed to load users");

      const [metricsJson, analyticsJson, trafficJson, trafficUsersJson, usersJson] = await Promise.all([
        metricsRes.json(),
        analyticsRes.json(),
        trafficRes.json(),
        trafficUsersRes.json(),
        usersRes.json(),
      ]);

      setMetrics({
        likes: metricsJson.total_likes ?? 0,
        comments: metricsJson.total_comments ?? 0,
        shares: metricsJson.total_shares ?? 0,
        posts: metricsJson.total_posts ?? 0,
        editPrompts: metricsJson.edit_prompts ?? 0,
        acceptedPrompts: metricsJson.accepted_prompts ?? 0,
        rejectedPrompts: metricsJson.rejected_prompts ?? 0,
        withdrawRequests: metricsJson.withdraw_requests ?? 0,
        totalUsers: metricsJson.total_users ?? 0,
      });

      setAnalyticsData(Array.isArray(analyticsJson.data) ? analyticsJson.data : []);
      setTrafficData(Array.isArray(trafficJson.data) ? trafficJson.data : []);
      setTrafficUsersToday(Array.isArray(trafficUsersJson.today_users) ? trafficUsersJson.today_users : []);
      setTrafficHistory(Array.isArray(trafficUsersJson.daily_history) ? trafficUsersJson.daily_history : []);
      const normalUsers = Array.isArray(usersJson.normal_users) ? usersJson.normal_users : [];
      const aiCreatorUsers = Array.isArray(usersJson.ai_creator_users) ? usersJson.ai_creator_users : [];
      setNormalUsersRows(normalUsers);
      setAiCreatorUsersRows(aiCreatorUsers);
      setUsersTotal(usersJson.total_users ?? 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load dashboard data");
      setMetrics(defaultMetrics);
      setAnalyticsData([]);
      setTrafficData([]);
      setTrafficUsersToday([]);
      setTrafficHistory([]);
      setNormalUsersRows([]);
      setAiCreatorUsersRows([]);
      setUsersTotal(0);
    } finally {
      setLoadingMetrics(false);
      setLoadingAnalytics(false);
      setLoadingTraffic(false);
      setLoadingTrafficUsers(false);
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(timelinePreset, timelineRange);
  }, [loadDashboardData, timelinePreset, timelineRange]);

  useEffect(() => {
    if (selectedMetrics.length === 0) {
      setSelectedMetrics(["posts", "totalUsers", "likes"]);
    }
  }, [selectedMetrics.length]);

  const calculateMetricChange = useCallback((metricId: string): number => {
    if (analyticsData.length < 2) return 0;
    const prev = Number(analyticsData[analyticsData.length - 2]?.[metricId as keyof AnalyticsPoint] ?? 0);
    const latest = Number(analyticsData[analyticsData.length - 1]?.[metricId as keyof AnalyticsPoint] ?? 0);
    if (prev === 0) return latest > 0 ? 100 : 0;
    return Number((((latest - prev) / prev) * 100).toFixed(1));
  }, [analyticsData]);

  const metricConfigs: MetricConfig[] = useMemo(
    () =>
      metricOrder.map((id) => ({
        id,
        title: metricTitles[id],
        value: metrics[id] ?? 0,
        change: calculateMetricChange(id),
        icon: metricIcons[id],
        lineColor: metricColors[id],
      })),
    [calculateMetricChange, metrics],
  );

  const handleToggle = useCallback((id: string) => {
    setSelectedMetrics((prev) => {
      if (prev.includes(id)) {
        return prev.filter((m) => m !== id);
      }
      if (prev.length >= MAX_SELECTIONS) {
        toast.error(`Maximum ${MAX_SELECTIONS} metrics can be selected`, {
          description: "Deselect one first.",
        });
        return prev;
      }
      return [...prev, id];
    });
  }, []);

  const selectedMetricConfigs = selectedMetrics.map((id) => {
    const metric = metricConfigs.find((m) => m.id === id)!;
    return { id: metric.id, title: metric.title, color: metric.lineColor };
  });

  const selectedStats = selectedMetrics.map((id) => {
    const metric = metricConfigs.find((m) => m.id === id)!;
    return {
      title: metric.title,
      value: metric.value,
      change: metric.change,
      color: metric.lineColor,
    };
  });

  const isMaxSelected = selectedMetrics.length >= MAX_SELECTIONS;

  const handleRangeChange = useCallback((preset: TimelinePreset, range?: DateRange) => {
    setTimelinePreset(preset);
    if (range) {
      setTimelineRange(range);
      return;
    }
    setTimelineRange(null);
  }, []);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Select up to {MAX_SELECTIONS} metrics to compare • <span className="text-primary font-medium">{selectedMetrics.length}/{MAX_SELECTIONS}</span>
            </p>
          </div>
          <TimelineFilter onRangeChange={handleRangeChange} />
        </div>

        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            {metricConfigs.map((metric) => (
              <MetricChip
                key={metric.id}
                id={metric.id}
                title={metric.title}
                icon={metric.icon}
                color={metric.lineColor}
                isSelected={selectedMetrics.includes(metric.id)}
                onToggle={handleToggle}
                disabled={(isMaxSelected && !selectedMetrics.includes(metric.id)) || loadingMetrics}
              />
            ))}
          </div>
        </div>

        <MetricStatsBar metrics={selectedStats} />

        <UnifiedChart
          selectedMetrics={selectedMetricConfigs}
          data={analyticsData}
          loading={loadingAnalytics}
        />

        <UsersDetailsTable
          normalUsers={normalUsersRows}
          aiCreatorUsers={aiCreatorUsersRows}
          totalUsers={usersTotal}
          loading={loadingUsers}
        />

        <TrafficChart data={trafficData} loading={loadingTraffic} />

        <TrafficUsersTable
          todayUsers={trafficUsersToday}
          dailyHistory={trafficHistory}
          loading={loadingTrafficUsers}
        />
      </div>
    </AdminLayout>
  );
};

export default Index;
