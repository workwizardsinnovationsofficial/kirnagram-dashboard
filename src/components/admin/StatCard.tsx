import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  colorClass?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon,
  colorClass = "from-primary to-accent",
}: StatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="glass-card rounded-xl p-5 hover:shadow-lg transition-all duration-300 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-display font-bold text-foreground">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5">
              {isPositive && (
                <TrendingUp className="w-4 h-4 text-chart-green" />
              )}
              {isNegative && (
                <TrendingDown className="w-4 h-4 text-destructive" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  isPositive && "text-chart-green",
                  isNegative && "text-destructive",
                  !isPositive && !isNegative && "text-muted-foreground"
                )}
              >
                {isPositive && "+"}
                {change}%
              </span>
              <span className="text-xs text-muted-foreground">{changeLabel}</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center",
            colorClass
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
