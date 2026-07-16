import { cn } from "@/lib/utils";
import { PromptRequest } from "@/types/prompt";
import { formatDistanceToNow } from "date-fns";
import { FileText, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface PromptRequestListProps {
  requests: PromptRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  subtitle?: string;
}

const statusConfig = {
  pending: { icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  approved: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
  modified: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
  modify: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
  delete_requested: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
  deleted: { icon: XCircle, color: "text-zinc-400", bg: "bg-zinc-500/10" },
};

export function PromptRequestList({ requests, selectedId, onSelect, subtitle }: PromptRequestListProps) {
  const statusLabel: Record<PromptRequest["status"], string> = {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    modified: "Modified",
    modify: "Modified",
    delete_requested: "Delete Request",
    deleted: "Deleted",
  };

  return (
    <div className="h-full flex flex-col bg-card/50 border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Requests
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {subtitle || `${requests.filter(r => r.status === "pending").length} pending review`}
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {requests.map((request) => {
            const StatusIcon = statusConfig[request.status].icon;
            const isSelected = selectedId === request.id;
            
            return (
              <button
                key={request.id}
                onClick={() => onSelect(request.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all duration-200",
                  "hover:bg-accent/50 group",
                  isSelected 
                    ? "bg-primary/10 border border-primary/30" 
                    : "bg-transparent border border-transparent"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    statusConfig[request.status].bg
                  )}>
                    <StatusIcon className={cn("w-4 h-4", statusConfig[request.status].color)} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {request.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      by {request.creatorName || request.creatorUsername || "Creator"}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0 h-4",
                          request.status === "delete_requested" && "border-red-500/40 text-red-400",
                          request.status === "pending" && "border-yellow-500/40 text-yellow-400"
                        )}
                      >
                        {statusLabel[request.status]}
                      </Badge>
                      {request.unitId && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                          {request.unitId}
                        </Badge>
                      )}
                      {request.aiModel && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                          {request.aiModel}
                        </Badge>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(request.submittedAt, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
