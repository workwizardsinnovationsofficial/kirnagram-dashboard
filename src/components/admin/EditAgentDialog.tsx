import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Eye, EyeOff, FileText, Megaphone, Users } from "lucide-react";
import type { Agent, AgentPermissions } from "@/types/agent";
import { toast } from "sonner";

interface EditAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: Agent | null;
  onUpdateAgent: (agent: Agent) => Promise<void>;
}

export function EditAgentDialog({ open, onOpenChange, agent, onUpdateAgent }: EditAgentDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<AgentPermissions>({
    prompts: false,
    ads: false,
    aiCreatorRequests: false,
  });
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!agent) {
      return;
    }
    setUsername(agent.username);
    setPassword(agent.password);
    setPermissions(agent.permissions);
    setIsActive(agent.isActive);
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agent) return;

    if (!username.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await onUpdateAgent({
        ...agent,
        username: username.trim(),
        password: password.trim(),
        permissions,
        isActive,
      });
      onOpenChange(false);
      toast.success("Agent updated successfully");
    } finally {
      setIsSubmitting(false);
    }
  };

  const permissionOptions = [
    { key: "prompts" as const, label: "Prompts Access", icon: FileText, description: "Can edit and manage prompts" },
    { key: "ads" as const, label: "Ads Access", icon: Megaphone, description: "Can edit and manage advertisements" },
    { key: "aiCreatorRequests" as const, label: "AI Creator Requests", icon: Users, description: "Can review and manage AI creator requests" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Agent</DialogTitle>
          <DialogDescription>Update login credentials and access permissions.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-username">Email</Label>
              <Input
                id="edit-username"
                placeholder="Enter agent email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2">
              <span className="text-sm text-foreground">Active</span>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Permissions</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Selected sections can be edited. Others are view-only.
            </p>

            <div className="space-y-3">
              {permissionOptions.map((perm) => (
                <div
                  key={perm.key}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <perm.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{perm.label}</p>
                      <p className="text-xs text-muted-foreground">{perm.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={permissions[perm.key]}
                    onCheckedChange={(checked) =>
                      setPermissions((prev) => ({ ...prev, [perm.key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
