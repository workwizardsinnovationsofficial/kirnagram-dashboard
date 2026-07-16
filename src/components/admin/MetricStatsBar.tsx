import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricStatProps {
  title: string;
  value: string | number;
  change: number;
  color: string;
}

export function MetricStatsBar({ metrics }: { metrics: MetricStatProps[] }) {
  if (metrics.length === 0) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <p className="text-muted-foreground">Select metrics above to see statistics</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex flex-wrap gap-6 justify-center">
        {metrics.map((metric) => {
          const isPositive = metric.change > 0;
          return (
            <div
              key={metric.title}
              className="flex items-center gap-3 px-4 py-2"
            >
              <div
                className="w-1 h-10 rounded-full"
                style={{ backgroundColor: metric.color }}
              />
              <div>
                <p className="text-xs text-muted-foreground">{metric.title}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">
                    {typeof metric.value === "number"
                      ? metric.value.toLocaleString()
                      : metric.value}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      isPositive ? "text-chart-green" : "text-destructive"
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {isPositive && "+"}
                    {metric.change}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
