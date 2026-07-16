import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "Apr", accepted: 850, rejected: 120, modifications: 230 },
  { month: "May", accepted: 920, rejected: 140, modifications: 280 },
  { month: "Jun", accepted: 980, rejected: 110, modifications: 320 },
  { month: "Jul", accepted: 1100, rejected: 150, modifications: 350 },
  { month: "Aug", accepted: 1250, rejected: 130, modifications: 400 },
  { month: "Sep", accepted: 1380, rejected: 160, modifications: 450 },
  { month: "Oct", accepted: 1520, rejected: 140, modifications: 520 },
  { month: "Nov", accepted: 1650, rejected: 180, modifications: 580 },
  { month: "Dec", accepted: 1800, rejected: 170, modifications: 620 },
  { month: "Jan", accepted: 1950, rejected: 190, modifications: 680 },
  { month: "Feb", accepted: 2100, rejected: 200, modifications: 750 },
  { month: "Mar", accepted: 2350, rejected: 220, modifications: 820 },
];

export function PromptsChart() {
  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold text-foreground">
          Prompt Analytics
        </h3>
        <p className="text-sm text-muted-foreground">
          Accepted, rejected, and modified prompts
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            <Bar
              dataKey="accepted"
              fill="hsl(var(--chart-green))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="rejected"
              fill="hsl(var(--destructive))"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="modifications"
              fill="hsl(var(--chart-yellow))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
