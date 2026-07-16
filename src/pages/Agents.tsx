import { useEffect, useMemo, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { CreateAgentDialog } from "@/components/admin/CreateAgentDialog";
import { EditAgentDialog } from "@/components/admin/EditAgentDialog";
import { AgentCard } from "@/components/admin/AgentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Users } from "lucide-react";
import type { Agent } from "@/types/agent";
import {
  loadAgentsFromFirestore,
  createAgentInFirestore,
  updateAgentInFirestore,
  deleteAgentFromFirestore,
} from "@/lib/agentStore";
import { toast } from "sonner";

const Agents = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  // Load agents from Firestore on mount
  useEffect(() => {
    loadAgentsFromFirestore()
      .then(setAgents)
      .catch(() => toast.error("Failed to load agents"))
      .finally(() => setLoading(false));
  }, []);

  const filteredAgents = useMemo(
    () =>
      agents.filter((agent) =>
        agent.username.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [agents, searchQuery],
  );

  const handleCreateAgent = async (newAgent: Omit<Agent, "id" | "createdAt">) => {
    try {
      const agent = await createAgentInFirestore(newAgent);
      setAgents((prev) => [agent, ...prev]);
    } catch {
      toast.error("Failed to create agent. Please try again.");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const agent = agents.find((a) => a.id === id);
    if (!agent) return;
    try {
      const updated = { ...agent, isActive };
      await updateAgentInFirestore(updated);
      setAgents((prev) => prev.map((a) => (a.id === id ? updated : a)));
      toast.success(isActive ? "Agent activated" : "Agent deactivated");
    } catch {
      toast.error("Failed to update agent status.");
    }
  };

  const handleDeleteAgent = async (id: string) => {
    try {
      await deleteAgentFromFirestore(id);
      setAgents((prev) => prev.filter((agent) => agent.id !== id));
      toast.success("Agent deleted");
    } catch {
      toast.error("Failed to delete agent. Please try again.");
    }
  };

  const handleEditAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setIsEditOpen(true);
  };

  const handleUpdateAgent = async (updatedAgent: Agent) => {
    try {
      await updateAgentInFirestore(updatedAgent);
      setAgents((prev) => prev.map((agent) => (agent.id === updatedAgent.id ? updatedAgent : agent)));
    } catch {
      toast.error("Failed to update agent. Please try again.");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Agents</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage agent accounts and their access permissions
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Agent
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-muted-foreground text-sm">Loading agents...</p>
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onToggleActive={handleToggleActive}
                onDelete={handleDeleteAgent}
                onEdit={handleEditAgent}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-12 flex flex-col items-center justify-center text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No agents found" : "No agents yet"}
            </h2>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Create your first agent to manage platform access"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Create Agent
              </Button>
            )}
          </div>
        )}

        {/* Create Dialog */}
        <CreateAgentDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onCreateAgent={handleCreateAgent}
        />
        <EditAgentDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          agent={selectedAgent}
          onUpdateAgent={handleUpdateAgent}
        />
      </div>
    </AdminLayout>
  );
};

export default Agents;
