import { useState } from "react";
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

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAgent: (agent: Omit<Agent, "id" | "createdAt">) => Promise<void>;
}

export function CreateAgentDialog({ open, onOpenChange, onCreateAgent }: CreateAgentDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<AgentPermissions>({
    prompts: false,
    ads: false,
    aiCreatorRequests: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error("Username and password are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateAgent({
        username: username.trim(),
        password: password.trim(),
        permissions,
        isActive: true,
      });
      // Reset form
      setUsername("");
      setPassword("");
      setPermissions({ prompts: false, ads: false, aiCreatorRequests: false });
      onOpenChange(false);
      toast.success("Agent created successfully");
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
          <DialogTitle className="text-foreground">Create New Agent</DialogTitle>
          <DialogDescription>
            Create login credentials and assign permissions. Agents can only edit sections they have access to.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Credentials */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                placeholder="Enter agent email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
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
          </div>

          {/* Permissions */}
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
              {isSubmitting ? "Creating..." : "Create Agent"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
