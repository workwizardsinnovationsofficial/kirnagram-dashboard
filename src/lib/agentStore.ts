import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Agent } from "@/types/agent";

const AGENTS_COLLECTION = "agents";

// ── Firestore CRUD ───────────────────────────────────────────────────────────

export const loadAgentsFromFirestore = async (): Promise<Agent[]> => {
  const snapshot = await getDocs(collection(db, AGENTS_COLLECTION));
  return snapshot.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      username: data.username as string,
      password: data.password as string,
      permissions: {
        prompts: Boolean(data.permissions?.prompts),
        ads: Boolean(data.permissions?.ads),
        aiCreatorRequests: Boolean(data.permissions?.aiCreatorRequests),
      },
      createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      isActive: Boolean(data.isActive),
    } satisfies Agent;
  });
};

export const createAgentInFirestore = async (
  agentData: Omit<Agent, "id" | "createdAt">,
): Promise<Agent> => {
  const id = crypto.randomUUID();
  const createdAt = new Date();
  const agent: Agent = { ...agentData, id, createdAt };
  await setDoc(doc(db, AGENTS_COLLECTION, id), {
    ...agentData,
    id,
    createdAt: createdAt.toISOString(),
  });
  return agent;
};

export const updateAgentInFirestore = async (agent: Agent): Promise<void> => {
  await updateDoc(doc(db, AGENTS_COLLECTION, agent.id), {
    username: agent.username,
    password: agent.password,
    permissions: agent.permissions,
    isActive: agent.isActive,
  });
};

export const deleteAgentFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, AGENTS_COLLECTION, id));
};

