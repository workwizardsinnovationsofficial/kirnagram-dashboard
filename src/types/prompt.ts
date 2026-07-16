export type PromptStatus = "pending" | "approved" | "rejected" | "modified" | "modify" | "delete_requested" | "deleted";

export interface PromptRequest {
  id: string;
  unitId?: string | null;
  userId: string;
  creatorName: string;
  creatorUsername?: string;
  creatorEmail?: string;
  creatorMobile?: string;
  creatorDob?: string;
  title: string;
  promptDescription: string;
  promptTemplate?: string;
  promptVariables?: Array<{
    key: string;
    label?: string;
    input_type?: "text" | "dropdown";
    options?: string[];
    placeholder?: string;
    default_value?: string;
    required?: boolean;
  }>;
  aiModel?: string;
  promptCategory?: string;
  aspectRatio?: string;
  requireReferenceImage?: boolean;
  sampleImageUrls?: string[];
  referenceCorrectImageUrls?: string[];
  referenceWrongImageUrls?: string[];
  submittedBy?: string;
  tags: string[];
  submittedAt: Date;
  status: PromptStatus;
  reason?: string;
  previewImage?: string;
  likesCount?: number;
  viewsCount?: number;
  commentsCount?: number;
  remixesCount?: number;
  payoutPerRemix?: number;
  burnCredits?: number;
  totalEarnings?: number;
}
