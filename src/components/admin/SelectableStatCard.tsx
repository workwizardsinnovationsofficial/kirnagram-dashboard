import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Check } from "lucide-react";

interface SelectableStatCardProps {
  id: string;
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  colorClass?: string;
  lineColor: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function SelectableStatCard({
  id,
  title,
  value,
  change,
  changeLabel = "vs last month",
  icon,
  colorClass = "from-primary to-accent",
  isSelected,
  onToggle,
  disabled = false,
}: SelectableStatCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <button
      onClick={() => !disabled && onToggle(id)}
      disabled={disabled && !isSelected}
      className={cn(
        "glass-card rounded-xl p-5 text-left transition-all duration-300 relative group w-full",
        isSelected
          ? "ring-2 ring-primary shadow-lg shadow-primary/20"
          : "hover:shadow-lg",
        disabled && !isSelected && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground opacity-0 group-hover:opacity-100"
        )}
      >
        <Check className="w-4 h-4" />
      </div>

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
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center transition-transform duration-200",
            colorClass,
            isSelected && "scale-110"
          )}
        >
          {icon}
        </div>
      </div>
    </button>
  );
}
