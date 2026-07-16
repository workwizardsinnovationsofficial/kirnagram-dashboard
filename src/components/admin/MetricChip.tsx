import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MetricChipProps {
  id: string;
  title: string;
  icon: ReactNode;
  color: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  disabled?: boolean;
}

export function MetricChip({
  id,
  title,
  icon,
  color,
  isSelected,
  onToggle,
  disabled = false,
}: MetricChipProps) {
  return (
    <button
      onClick={() => !disabled && onToggle(id)}
      disabled={disabled && !isSelected}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
        "border focus:outline-none focus:ring-2 focus:ring-primary/50",
        isSelected
          ? "border-transparent text-white shadow-lg"
          : "border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground hover:border-muted",
        disabled && !isSelected && "opacity-40 cursor-not-allowed"
      )}
      style={{
        backgroundColor: isSelected ? color : undefined,
        boxShadow: isSelected ? `0 4px 14px ${color}40` : undefined,
      }}
    >
      <span className={cn("w-4 h-4", isSelected ? "text-white" : "text-muted-foreground")}>
        {icon}
      </span>
      <span>{title}</span>
      {isSelected && <Check className="w-3.5 h-3.5 ml-1" />}
    </button>
  );
}
