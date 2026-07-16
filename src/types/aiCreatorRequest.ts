export interface AICreatorRequest {
  id: string;
  userId: string;
  username: string;
  email: string;
  name: string;
  mobile?: string;
  dob?: string;
  instagram?: string;
  youtube?: string;
  x?: string;
  linkedin?: string;
  website?: string;
  reason?: string;
  portfolioUrl?: string;
  bio?: string;
  experience?: string;
  portfolio?: string[];
  submittedAt: Date;
  status: "pending" | "approved" | "rejected" | "suspended" | "blocked";
  suspensionDays?: number;
  suspendedUntil?: string;
  suspensionReason?: string;
  blockReason?: string;
}
