import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { month: "Apr", newUsers: 320, totalActive: 4200 },
  { month: "May", newUsers: 380, totalActive: 4800 },
  { month: "Jun", newUsers: 420, totalActive: 5400 },
  { month: "Jul", newUsers: 510, totalActive: 6100 },
  { month: "Aug", newUsers: 580, totalActive: 6900 },
  { month: "Sep", newUsers: 650, totalActive: 7800 },
  { month: "Oct", newUsers: 720, totalActive: 8700 },
  { month: "Nov", newUsers: 810, totalActive: 9600 },
  { month: "Dec", newUsers: 920, totalActive: 10800 },
  { month: "Jan", newUsers: 1050, totalActive: 12000 },
  { month: "Feb", newUsers: 1180, totalActive: 13400 },
  { month: "Mar", newUsers: 1350, totalActive: 15000 },
];

export function UsersChart() {
  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold text-foreground">
          User Growth
        </h3>
        <p className="text-sm text-muted-foreground">
          New user registrations and total active users
        </p>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              yAxisId="left"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
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
              yAxisId="left"
              dataKey="newUsers"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
              name="New Users"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="totalActive"
              stroke="hsl(var(--chart-cyan))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-cyan))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Total Active"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
