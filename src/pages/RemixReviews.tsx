import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { CheckCircle, XCircle, Image, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface RemixReview {
  id: string;
  prompt_id?: string;
  prompt_title?: string;
  remix_user_id?: string;
  remix_username?: string;
  remix_user_full_name?: string;
  image_url?: string;
  rating?: string | null;
  comment?: string | null;
  improvement?: string | null;
  reviewed_at?: string;
  remix_created_at?: string;
}

const API_URL = "http://127.0.0.1:8000/admin/ai-creator/remix-reviews";

const RemixReviews = () => {
  const [reviews, setReviews] = useState<RemixReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "good" | "bad">("all");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = new URL(API_URL);
      if (filter !== "all") {
        url.searchParams.set("rating", filter);
      }

      const res = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to load remix reviews");
      }

      const data = await res.json();
      setReviews(Array.isArray(data.reviews) ? data.reviews : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load remix reviews");
      toast.error(err?.message || "Failed to load remix reviews");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-0px)] flex flex-col">
        <div className="p-6 border-b border-border shrink-0">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Remix Reviews</h1>
              <p className="text-sm text-muted-foreground">
                View all reviewed remix submissions, including good/bad ratings and improvement feedback.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "good", "bad"] as const).map((value) => (
                <Button
                  key={value}
                  variant={filter === value ? "secondary" : "outline"}
                  onClick={() => setFilter(value)}
                  className="text-sm"
                >
                  {value === "all" ? "All Reviews" : value === "good" ? "Good" : "Needs Improvement"}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading reviews...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-500">{error}</div>
          ) : reviews.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No remix reviews found.</div>
          ) : (
            <ScrollArea className="h-full p-6">
              <div className="grid gap-4">
                {reviews.map((review) => (
                  <Card key={review.id} className="border-border bg-card/60">
                    <CardContent className="grid gap-4 lg:grid-cols-[280px_1fr]">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Image className="w-4 h-4" />
                          <span>Prompt</span>
                        </div>
                        <p className="text-base font-semibold text-foreground">{review.prompt_title || "Unknown prompt"}</p>
                        <div className="text-sm text-muted-foreground">
                          <p>Prompt ID: {review.prompt_id}</p>
                          <p>Review ID: {review.id}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Reviewer</p>
                          <a
                            href={
                              review.remix_user_id
                                ? `http://localhost:3000/user/${encodeURIComponent(review.remix_user_id)}`
                                : undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {review.remix_user_full_name || review.remix_username || review.remix_user_id || "Unknown user"}
                          </a>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={review.rating === "good" ? "secondary" : "destructive"} className="uppercase text-xs">
                            {review.rating === "good" ? "Good" : review.rating === "bad" ? "Bad" : "Unrated"}
                          </Badge>
                          {review.reviewed_at && (
                            <Badge variant="outline" className="uppercase text-xs">
                              {format(new Date(review.reviewed_at), "MMM d, yyyy h:mm a")}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        {review.image_url ? (
                          <img
                            src={review.image_url}
                            alt="Remix preview"
                            className="w-full max-h-72 rounded-xl border border-border object-cover"
                          />
                        ) : (
                          <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-center text-sm text-muted-foreground">
                            <div className="flex items-center justify-center gap-2">
                              <MessageCircle className="w-4 h-4" />
                              No preview image available
                            </div>
                          </div>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Comment</p>
                            <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                              {review.comment || "No comment provided."}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Improvement</p>
                            <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                              {review.improvement || "No improvement feedback."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default RemixReviews;
