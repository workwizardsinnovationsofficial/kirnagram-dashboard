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

interface MetricConfig {
  id: string;
  title: string;
  color: string;
}

interface UnifiedChartProps {
  selectedMetrics: MetricConfig[];
  data: Array<{ period: string } & Record<string, string | number>>;
  loading?: boolean;
}

export function UnifiedChart({ selectedMetrics, data, loading = false }: UnifiedChartProps) {
  if (selectedMetrics.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 animate-fade-in">
        <div className="h-80 flex flex-col items-center justify-center text-center">
          <h3 className="text-xl font-display font-semibold text-foreground mb-2">
            Select Metrics to Compare
          </h3>
          <p className="text-muted-foreground max-w-md">
            Click metric cards above to add them to this graph.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 animate-fade-in">
      <div className="mb-6 flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-display font-semibold text-foreground">Unified Analytics View</h3>
          <p className="text-sm text-muted-foreground">
            Comparing {selectedMetrics.length} metric{selectedMetrics.length > 1 ? "s" : ""} over time
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedMetrics.map((metric) => (
            <div
              key={metric.id}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <span className="text-xs font-medium text-foreground">{metric.title}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-96">
        {loading ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="period"
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
              {selectedMetrics.map((metric) => (
                <Line
                  key={metric.id}
                  type="monotone"
                  dataKey={metric.id}
                  name={metric.title}
                  stroke={metric.color}
                  strokeWidth={2.5}
                  dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
