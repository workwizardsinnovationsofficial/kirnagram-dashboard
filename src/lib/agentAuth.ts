import type { Agent } from "@/types/agent";
import { loadAgentsFromFirestore } from "./agentStore";

const AGENT_AUTH_STORAGE_KEY = "kg_agent_authed";
const AGENT_ID_STORAGE_KEY = "kg_agent_id";
const AGENT_META_STORAGE_KEY = "kg_agent_meta";

export interface AgentAuthInfo {
  id: string;
  username: string;
  permissions: {
    prompts: boolean;
    ads: boolean;
    aiCreatorRequests: boolean;
  };
}

export const isAgentAuthenticated = () => localStorage.getItem(AGENT_AUTH_STORAGE_KEY) === "true";

/** Reads cached agent info from localStorage — synchronous, no network. */
export const getAuthenticatedAgent = (): AgentAuthInfo | null => {
  if (!isAgentAuthenticated()) return null;
  const raw = localStorage.getItem(AGENT_META_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AgentAuthInfo;
  } catch {
    return null;
  }
};

export const setAgentAuthenticated = (agentId: string, meta: AgentAuthInfo) => {
  localStorage.setItem(AGENT_AUTH_STORAGE_KEY, "true");
  localStorage.setItem(AGENT_ID_STORAGE_KEY, agentId);
  localStorage.setItem(AGENT_META_STORAGE_KEY, JSON.stringify(meta));
};

export const clearAgentAuthenticated = () => {
  localStorage.removeItem(AGENT_AUTH_STORAGE_KEY);
  localStorage.removeItem(AGENT_ID_STORAGE_KEY);
  localStorage.removeItem(AGENT_META_STORAGE_KEY);
};

/**
 * Validates agent credentials against Firestore.
 * Returns the matching Agent or null.
 */
export const validateAgentCredentials = async (
  username: string,
  password: string,
): Promise<Agent | null> => {
  const agents = await loadAgentsFromFirestore();
  const agent = agents.find(
    (a) =>
      a.username.toLowerCase() === username.toLowerCase() &&
      a.password === password &&
      a.isActive,
  );
  return agent ?? null;
};
