import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface DailyHistoryRow {
  date: string;
  active_users: number;
  total_hits: number;
  total_time_minutes: number;
}

interface TrafficUsersTableProps {
  todayUsers: TrafficUserRow[];
  dailyHistory: DailyHistoryRow[];
  loading?: boolean;
}

const displayText = (value?: string) => {
  const text = (value || "").trim();
  return text.length ? text : "-";
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
};

const formatDuration = (seconds?: number) => {
  const safe = Math.max(0, Number(seconds || 0));
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;

  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

export function TrafficUsersTable({ todayUsers, dailyHistory, loading = false }: TrafficUsersTableProps) {
  const [activeView, setActiveView] = useState<"today" | "history">("today");

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Website Traffic Users</h3>
          <p className="text-sm text-foreground/75">
            Today users and daily saved history in one container
          </p>
        </div>
        <div className="rounded-md bg-muted/60 px-3 py-1.5 text-sm font-medium text-foreground">
          {activeView === "today" ? `Active Today: ${todayUsers.length}` : `Days: ${dailyHistory.length}`}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-muted/30 p-1.5 w-fit">
        <button
          type="button"
          onClick={() => setActiveView("today")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === "today"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Today Users ({todayUsers.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveView("history")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeView === "history"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Daily History ({dailyHistory.length})
        </button>
      </div>

      {activeView === "today" ? (
        <>
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-foreground">Today Website Users</h4>
            <span className="text-xs text-muted-foreground">Usage under 1 minute is counted as 0</span>
          </div>

          <Table className="text-foreground [&_th]:text-foreground/80 [&_th]:font-semibold [&_td]:text-foreground/95">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>User Type</TableHead>
                <TableHead>First Seen</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Time Used</TableHead>
                <TableHead>Hits</TableHead>
                <TableHead>Last Path</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground font-medium">
                    Loading today users...
                  </TableCell>
                </TableRow>
              ) : todayUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground font-medium">
                    No tracked user activity for today yet.
                  </TableCell>
                </TableRow>
              ) : (
                todayUsers.map((user) => (
                  <TableRow key={user.user_id} className="text-foreground/95">
                    <TableCell className="font-semibold">{displayText(user.name)}</TableCell>
                    <TableCell>{displayText(user.username) === "-" ? "-" : `@${displayText(user.username)}`}</TableCell>
                    <TableCell className="capitalize">{user.user_type === "ai_creator" ? "AI Creator" : "Normal User"}</TableCell>
                    <TableCell>{formatDateTime(user.first_seen_at)}</TableCell>
                    <TableCell>{formatDateTime(user.last_seen_at)}</TableCell>
                    <TableCell className="font-medium">{formatDuration(user.time_used_seconds)}</TableCell>
                    <TableCell className="font-medium">{user.hit_count ?? 0}</TableCell>
                    <TableCell className="max-w-[220px] truncate" title={displayText(user.last_path)}>
                      {displayText(user.last_path)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h4 className="text-base font-semibold text-foreground">Daily Activity History</h4>
            <span className="text-xs text-muted-foreground">Saved day-wise usage history</span>
          </div>

          <Table className="text-foreground [&_th]:text-foreground/80 [&_th]:font-semibold [&_td]:text-foreground/95">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Active Users</TableHead>
                <TableHead>Total Hits</TableHead>
                <TableHead>Total Time (Minutes)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground font-medium">
                    Loading activity history...
                  </TableCell>
                </TableRow>
              ) : dailyHistory.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground font-medium">
                    No daily history available yet.
                  </TableCell>
                </TableRow>
              ) : (
                dailyHistory.map((day) => (
                  <TableRow key={day.date} className="text-foreground/95">
                    <TableCell className="font-semibold">{displayText(day.date)}</TableCell>
                    <TableCell className="font-medium">{day.active_users ?? 0}</TableCell>
                    <TableCell className="font-medium">{day.total_hits ?? 0}</TableCell>
                    <TableCell className="font-medium">{day.total_time_minutes ?? 0}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
