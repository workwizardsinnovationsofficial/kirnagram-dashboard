import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "Apr", likes: 4200, comments: 2400, shares: 1800, saves: 2800 },
  { month: "May", likes: 5100, comments: 2800, shares: 2200, saves: 3200 },
  { month: "Jun", likes: 4800, comments: 3100, shares: 2000, saves: 3500 },
  { month: "Jul", likes: 6200, comments: 3400, shares: 2800, saves: 4100 },
  { month: "Aug", likes: 7800, comments: 4200, shares: 3200, saves: 4800 },
  { month: "Sep", likes: 8500, comments: 4800, shares: 3800, saves: 5200 },
  { month: "Oct", likes: 9200, comments: 5100, shares: 4200, saves: 5800 },
  { month: "Nov", likes: 8800, comments: 5500, shares: 4500, saves: 6200 },
  { month: "Dec", likes: 10500, comments: 6200, shares: 5100, saves: 7000 },
  { month: "Jan", likes: 11200, comments: 6800, shares: 5500, saves: 7500 },
  { month: "Feb", likes: 12000, comments: 7200, shares: 6000, saves: 8200 },
  { month: "Mar", likes: 13500, comments: 8100, shares: 6800, saves: 9000 },
];

export function EngagementChart() {
  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold text-foreground">
          Engagement Overview
        </h3>
        <p className="text-sm text-muted-foreground">
          Likes, comments, shares, and saves over time
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="likes"
              stroke="hsl(var(--chart-cyan))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-cyan))", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="comments"
              stroke="hsl(var(--chart-purple))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-purple))", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="shares"
              stroke="hsl(var(--chart-pink))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-pink))", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="saves"
              stroke="hsl(var(--chart-green))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-green))", strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
