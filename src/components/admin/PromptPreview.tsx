import { PromptRequest } from "@/types/prompt";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  User, 
  Calendar, 
  Tag, 
  Palette,
  FileText,
  IndianRupee
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface PromptPreviewProps {
  request: PromptRequest | null;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onModify: (id: string) => void;
  onUpdatePayout?: (id: string, payoutPerRemix: number) => void;
  updatingPayout?: boolean;
  onUpdateBurnCredits?: (id: string, burnCredits: number) => void;
  updatingBurnCredits?: boolean;
}

export function PromptPreview({ request, onAccept, onReject, onModify, onUpdatePayout, updatingPayout = false, onUpdateBurnCredits, updatingBurnCredits = false }: PromptPreviewProps) {
  const [payoutInput, setPayoutInput] = useState(1);
  const [burnCreditsInput, setBurnCreditsInput] = useState(3);

  useEffect(() => {
    setPayoutInput(request?.payoutPerRemix ?? 1);
  }, [request?.id, request?.payoutPerRemix]);

  useEffect(() => {
    setBurnCreditsInput(request?.burnCredits ?? 3);
  }, [request?.id, request?.burnCredits]);

  if (!request) {
    return (
      <div className="h-full flex items-center justify-center bg-background/50">
        <div className="text-center">
          <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Select a request to preview</p>
        </div>
      </div>
    );
  }

  const isDeleteRequest = request.status === "delete_requested";
  const isActionable = request.status === "pending" || request.status === "modified" || request.status === "modify" || isDeleteRequest;
  const currentPayout = request.payoutPerRemix ?? 1;
  const estimatedEarnings = (request.remixesCount ?? 0) * currentPayout;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with Actions */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-display font-bold text-foreground truncate">
              {request.title}
            </h1>
            {isDeleteRequest && (
              <div className="mt-2 inline-flex items-center rounded-md border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400">
                Deletion request pending admin decision
              </div>
            )}
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {request.creatorName || request.creatorUsername || "Creator"}
              </span>
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">
                <IndianRupee className="h-3 w-3" />
                Rs {currentPayout}/remix
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {format(request.submittedAt, "MMM d, yyyy 'at' h:mm a")}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Total earning: Rs {estimatedEarnings}
            </p>
            <div className="mt-2 text-xs text-muted-foreground">
              {request.creatorEmail && <span>Email: {request.creatorEmail}</span>}
              {request.creatorMobile && <span className="ml-3">Mobile: {request.creatorMobile}</span>}
            </div>
          </div>
          
          {/* Action Buttons */}
          {isActionable && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => onAccept(request.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {isDeleteRequest ? "Approve Delete" : "Accept"}
              </Button>
              <Button
                onClick={() => onReject(request.id)}
                variant="destructive"
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                {isDeleteRequest ? "Reject Delete" : "Reject"}
              </Button>
              {!isDeleteRequest && (
                <Button
                  onClick={() => onModify(request.id)}
                  variant="outline"
                  className="gap-2 border-orange-500/50 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400"
                >
                  <Edit3 className="w-4 h-4" />
                  Modify
                </Button>
              )}
            </div>
          )}
          
          {!isActionable && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-sm px-3 py-1",
                request.status === "approved" && "border-emerald-500/50 text-emerald-500 bg-emerald-500/10",
                request.status === "rejected" && "border-red-500/50 text-red-500 bg-red-500/10",
                (request.status === "modify" || request.status === "modified") && "border-orange-500/50 text-orange-500 bg-orange-500/10",
                request.status === "delete_requested" && "border-red-500/50 text-red-400 bg-red-500/10",
                request.status === "deleted" && "border-zinc-500/50 text-zinc-400 bg-zinc-500/10"
              )}
            >
              {request.status === "approved" && "Approved"}
              {request.status === "rejected" && "Rejected"}
              {(request.status === "modify" || request.status === "modified") && "Modified"}
              {request.status === "delete_requested" && "Delete Requested"}
              {request.status === "deleted" && "Deleted"}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* AI Model & Unit ID */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">AI Model</span>
                </div>
                <p className="text-foreground font-medium">{request.aiModel || "-"}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Palette className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Prompt ID</span>
                </div>
                <p className="text-foreground font-medium">{request.unitId || "-"}</p>
              </CardContent>
            </Card>
          </div>

          {/* Prompt Content */}
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <FileText className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Prompt Content</span>
              </div>
              <div className="bg-background/50 rounded-lg p-4 border border-border">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {request.promptDescription}
                </p>
              </div>
            </CardContent>
          </Card>

          {isDeleteRequest && (
            <Card className="bg-card/50 border-red-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-red-400 mb-3">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Delete Request Details</span>
                </div>
                <p className="text-sm text-foreground">
                  Creator asked to remove this live prompt post from home feed and profile prompt list.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {request.reason || "No reason provided by creator."}
                </p>
              </CardContent>
            </Card>
          )}

          {request.promptTemplate && (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <FileText className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Prompt Template</span>
                </div>
                <div className="bg-background/50 rounded-lg p-4 border border-border">
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {request.promptTemplate}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {Array.isArray(request.promptVariables) && request.promptVariables.length > 0 && (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Tag className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Template Variables</span>
                </div>
                <div className="space-y-2">
                  {request.promptVariables.map((item) => (
                    <div key={item.key} className="rounded-lg border border-border bg-background/40 p-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-semibold">{item.label || item.key}</span>
                        <Badge variant="outline">{item.input_type || "text"}</Badge>
                        {item.required && <Badge variant="secondary">Required</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Key: {item.key}</p>
                      {item.placeholder && (
                        <p className="text-xs text-muted-foreground mt-1">Placeholder: {item.placeholder}</p>
                      )}
                      {item.default_value && (
                        <p className="text-xs text-muted-foreground mt-1">Default: {item.default_value}</p>
                      )}
                      {Array.isArray(item.options) && item.options.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Options: {item.options.join(", ")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {(request.aspectRatio || request.requireReferenceImage || (request.sampleImageUrls || []).length > 0) && (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Palette className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Generation Setup</span>
                </div>
                <div className="grid md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <p>Aspect Ratio: {request.aspectRatio || "-"}</p>
                  <p>Reference Required: {request.requireReferenceImage ? "Yes" : "No"}</p>
                  <p>Sample Images: {(request.sampleImageUrls || []).length}</p>
                  <p>Correct References: {(request.referenceCorrectImageUrls || []).length}</p>
                  <p>Wrong References: {(request.referenceWrongImageUrls || []).length}</p>
                </div>

                {/* Show correct reference images */}
                {Array.isArray(request.referenceCorrectImageUrls) && request.referenceCorrectImageUrls.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-emerald-500 mb-1">Correct Reference Images</div>
                    <div className="flex flex-wrap gap-2">
                      {request.referenceCorrectImageUrls.map((url, idx) => (
                        <img
                          key={url + idx}
                          src={url}
                          alt={`Correct reference ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded border border-emerald-400 bg-background"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Show wrong reference images */}
                {Array.isArray(request.referenceWrongImageUrls) && request.referenceWrongImageUrls.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-red-500 mb-1">Wrong Reference Images</div>
                    <div className="flex flex-wrap gap-2">
                      {request.referenceWrongImageUrls.map((url, idx) => (
                        <img
                          key={url + idx}
                          src={url}
                          alt={`Wrong reference ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded border border-red-400 bg-background"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(request.likesCount || request.viewsCount || request.commentsCount || request.remixesCount) && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Likes", value: request.likesCount ?? 0 },
                { label: "Views", value: request.viewsCount ?? 0 },
                { label: "Comments", value: request.commentsCount ?? 0 },
                { label: "Remixes", value: request.remixesCount ?? 0 },
              ].map((item) => (
                <Card key={item.label} className="bg-card/50 border-border">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-lg font-semibold text-foreground mt-1">{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <IndianRupee className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Remix Payout</span>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current payout</p>
                  <p className="text-xl font-semibold text-foreground">Rs {currentPayout} / remix</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimated total earnings: Rs {estimatedEarnings}
                  </p>
                </div>
                {request.status === "approved" && onUpdatePayout && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={payoutInput}
                      onChange={(event) => setPayoutInput(Number(event.target.value) || 0)}
                      className="w-28"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={updatingPayout || payoutInput === currentPayout}
                      onClick={() => onUpdatePayout(request.id, payoutInput)}
                    >
                      {updatingPayout ? "Saving..." : "Update"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <IndianRupee className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Burn Credits</span>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current burn credits</p>
                  <p className="text-xl font-semibold text-foreground">{request.burnCredits ?? 3} / remix</p>
                </div>
                {request.status === "approved" && onUpdateBurnCredits && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      value={burnCreditsInput}
                      onChange={(event) => setBurnCreditsInput(Number(event.target.value) || 0)}
                      className="w-28"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={updatingBurnCredits || burnCreditsInput === (request.burnCredits ?? 3)}
                      onClick={() => onUpdateBurnCredits(request.id, burnCreditsInput)}
                    >
                      {updatingBurnCredits ? "Saving..." : "Update"}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Tags */}
          <Card className="bg-card/50 border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Tag className="w-4 h-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {request.tags.length > 0 ? (
                  request.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary"
                      className="bg-primary/10 text-primary border-primary/20"
                    >
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No tags</span>
                )}
              </div>
            </CardContent>
          </Card>

          {request.reason && (
            <Card className="bg-card/50 border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Edit3 className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Reason</span>
                </div>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{request.reason}</p>
              </CardContent>
            </Card>
          )}

          {/* Preview Image */}
          {request.previewImage && (
            <Card className="bg-card/50 border-border overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Palette className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Preview</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={request.previewImage} 
                    alt="Preview" 
                    className="w-full max-h-[360px] object-contain bg-background"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
