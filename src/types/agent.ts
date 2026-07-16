export interface Agent {
  id: string;
  username: string;
  password: string;
  permissions: {
    prompts: boolean;
    ads: boolean;
    aiCreatorRequests: boolean;
  };
  createdAt: Date;
  isActive: boolean;
}
export interface AgentPermissions {
  prompts: boolean;
  ads: boolean;
  aiCreatorRequests: boolean;
}
