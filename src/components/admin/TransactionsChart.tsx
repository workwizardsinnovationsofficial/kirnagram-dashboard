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
  { month: "Apr", withdraws: 12500, recharges: 28000 },
  { month: "May", withdraws: 14200, recharges: 32000 },
  { month: "Jun", withdraws: 13800, recharges: 35000 },
  { month: "Jul", withdraws: 16500, recharges: 42000 },
  { month: "Aug", withdraws: 18200, recharges: 48000 },
  { month: "Sep", withdraws: 21000, recharges: 55000 },
  { month: "Oct", withdraws: 23500, recharges: 62000 },
  { month: "Nov", withdraws: 26000, recharges: 68000 },
  { month: "Dec", withdraws: 28500, recharges: 75000 },
  { month: "Jan", withdraws: 31000, recharges: 82000 },
  { month: "Feb", withdraws: 34000, recharges: 90000 },
  { month: "Mar", withdraws: 38000, recharges: 98000 },
];

export function TransactionsChart() {
  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-display font-semibold text-foreground">
          Financial Transactions
        </h3>
        <p className="text-sm text-muted-foreground">
          Withdrawals and recharges over time
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
              formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="recharges"
              stroke="hsl(var(--chart-green))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-green))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="withdraws"
              stroke="hsl(var(--chart-orange))"
              strokeWidth={3}
              dot={{ fill: "hsl(var(--chart-orange))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
