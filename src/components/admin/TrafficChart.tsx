import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface TrafficPoint {
  hour: string;
  traffic: number;
}

interface TrafficChartProps {
  data: TrafficPoint[];
  loading?: boolean;
}

export function TrafficChart({ data, loading = false }: TrafficChartProps) {
  const safeData = data.length ? data : Array.from({ length: 24 }, (_, i) => ({ hour: `${i.toString().padStart(2, "0")}:00`, traffic: 0 }));

  const peakHour = safeData.reduce((max, item) => (item.traffic > max.traffic ? item : max), safeData[0]);
  const lowHour = safeData.reduce((min, item) => (item.traffic < min.traffic ? item : min), safeData[0]);
  const avgTraffic = Math.round(safeData.reduce((sum, item) => sum + item.traffic, 0) / safeData.length);

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Traffic Management</h3>
          <p className="text-sm text-muted-foreground">User activity throughout the day</p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Peak</p>
            <p className="font-semibold text-chart-green">{peakHour.hour}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Low</p>
            <p className="font-semibold text-chart-orange">{lowHour.hour}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Average</p>
            <p className="font-semibold text-primary">{avgTraffic}</p>
          </div>
        </div>
      </div>
      <div className="h-80">
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">Loading traffic...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTraffic" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="hour"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                interval={2}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value} actions`, "Traffic"]}
              />
              <ReferenceLine
                y={avgTraffic}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="5 5"
                label={{ value: "Avg", position: "right", fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="traffic"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTraffic)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
