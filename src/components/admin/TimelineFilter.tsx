import { useState } from "react";
import { format, subDays, subMonths, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type TimelinePreset = 
  | "live"
  | "today"
  | "yesterday"
  | "7days"
  | "30days"
  | "90days"
  | "custom";

interface DateRange {
  from: Date;
  to: Date;
}

interface TimelineFilterProps {
  onRangeChange: (preset: TimelinePreset, range: DateRange) => void;
}

const presets: { label: string; value: TimelinePreset }[] = [
  { label: "Live", value: "live" },
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "Last 7 Days", value: "7days" },
  { label: "Last 30 Days", value: "30days" },
  { label: "Last 90 Days", value: "90days" },
  { label: "Custom Range", value: "custom" },
];

export function TimelineFilter({ onRangeChange }: TimelineFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<TimelinePreset>("30days");
  const [customRange, setCustomRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [isFromOpen, setIsFromOpen] = useState(false);
  const [isToOpen, setIsToOpen] = useState(false);

  const getDateRange = (preset: TimelinePreset): DateRange => {
    const now = new Date();
    switch (preset) {
      case "live":
        return { from: startOfDay(now), to: endOfDay(now) };
      case "today":
        return { from: startOfDay(now), to: endOfDay(now) };
      case "yesterday":
        const yesterday = subDays(now, 1);
        return { from: startOfDay(yesterday), to: endOfDay(yesterday) };
      case "7days":
        return { from: subDays(now, 7), to: now };
      case "30days":
        return { from: subDays(now, 30), to: now };
      case "90days":
        return { from: subDays(now, 90), to: now };
      case "custom":
        return customRange;
      default:
        return { from: subDays(now, 30), to: now };
    }
  };

  const handlePresetSelect = (preset: TimelinePreset) => {
    setSelectedPreset(preset);
    setIsPresetOpen(false);
    if (preset !== "custom") {
      const range = getDateRange(preset);
      onRangeChange(preset, range);
    }
  };

  const handleCustomFromChange = (date: Date | undefined) => {
    if (date) {
      const newRange = { ...customRange, from: date };
      setCustomRange(newRange);
      setIsFromOpen(false);
      if (selectedPreset === "custom") {
        onRangeChange("custom", newRange);
      }
    }
  };

  const handleCustomToChange = (date: Date | undefined) => {
    if (date) {
      const newRange = { ...customRange, to: date };
      setCustomRange(newRange);
      setIsToOpen(false);
      if (selectedPreset === "custom") {
        onRangeChange("custom", newRange);
      }
    }
  };

  const getPresetLabel = () => {
    return presets.find((p) => p.value === selectedPreset)?.label || "Select";
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Preset Selector */}
      <Popover open={isPresetOpen} onOpenChange={setIsPresetOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            className="h-9 min-w-[150px] px-3"
          >
            <CalendarIcon className="w-4 h-4 mr-2 opacity-70" />
            <span className="flex-1 text-left">{getPresetLabel()}</span>
            <ChevronDown className="w-4 h-4 ml-2 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="start">
          <div className="flex flex-col">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset.value)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors text-left",
                  selectedPreset === preset.value
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                )}
              >
                {preset.value === "live" && (
                  <span className="w-2 h-2 rounded-full bg-chart-green animate-pulse" />
                )}
                {preset.label}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Custom Date Range Pickers */}
      {selectedPreset === "custom" && (
        <div className="flex items-center gap-2">
          <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 min-w-[148px] justify-start text-left font-medium bg-card/80 border-border/80 text-foreground shadow-sm hover:bg-card",
                  !customRange.from && "text-foreground/65"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {customRange.from ? format(customRange.from, "MMM dd, yyyy") : "From"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customRange.from}
                onSelect={handleCustomFromChange}
                disabled={(date) => date > new Date() || date > customRange.to}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm font-medium text-foreground/80">to</span>

          <Popover open={isToOpen} onOpenChange={setIsToOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 min-w-[148px] justify-start text-left font-medium bg-card/80 border-border/80 text-foreground shadow-sm hover:bg-card",
                  !customRange.to && "text-foreground/65"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {customRange.to ? format(customRange.to, "MMM dd, yyyy") : "To"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={customRange.to}
                onSelect={handleCustomToChange}
                disabled={(date) => date > new Date() || date < customRange.from}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Active Range Display */}
      {selectedPreset !== "custom" && selectedPreset !== "live" && (
        <span className="rounded-md bg-card/60 px-3 py-1.5 text-sm font-medium text-foreground/85 border border-border/60">
          {format(getDateRange(selectedPreset).from, "MMM dd")} - {format(getDateRange(selectedPreset).to, "MMM dd, yyyy")}
        </span>
      )}

      {selectedPreset === "live" && (
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-chart-green"></span>
          </span>
          <span className="text-sm text-chart-green font-medium">Real-time data</span>
        </div>
      )}
    </div>
  );
}
