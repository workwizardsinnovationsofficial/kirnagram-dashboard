import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, MoreVertical, Trash2, Edit, Eye, EyeOff, FileText, Megaphone, Users } from "lucide-react";
import type { Agent } from "@/types/agent";

interface AgentCardProps {
  agent: Agent;
  onToggleActive: (id: string, isActive: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (agent: Agent) => void;
}

export function AgentCard({ agent, onToggleActive, onDelete, onEdit }: AgentCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  const permissionBadges = [
    { key: "prompts" as const, label: "Prompts", icon: FileText, color: "bg-violet-500/20 text-violet-400" },
    { key: "ads" as const, label: "Ads", icon: Megaphone, color: "bg-orange-500/20 text-orange-400" },
    {
      key: "aiCreatorRequests" as const,
      label: "AI Creators",
      icon: Users,
      color: "bg-emerald-500/20 text-emerald-400",
    },
  ];

  const activePermissions = permissionBadges.filter((p) => agent.permissions[p.key]);

  return (
    <div
      className={cn(
        "glass-card rounded-xl p-5 transition-all duration-200",
        !agent.isActive && "opacity-60"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{agent.username}</h3>
            <p className="text-xs text-muted-foreground">
              Created {agent.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={agent.isActive}
            onCheckedChange={(checked) => onToggleActive(agent.id, checked)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem onClick={() => onEdit(agent)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(agent.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Password */}
      <div className="mb-4 p-3 rounded-lg bg-background/50 border border-border">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password</span>
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-sm font-mono text-foreground mt-1">
          {showPassword ? agent.password : "••••••••"}
        </p>
      </div>

      {/* Permissions */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">Permissions</p>
        <div className="flex flex-wrap gap-2">
          {activePermissions.length > 0 ? (
            activePermissions.map((perm) => (
              <Badge key={perm.key} variant="secondary" className={cn("gap-1", perm.color)}>
                <perm.icon className="w-3 h-3" />
                {perm.label}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">View-only access</span>
          )}
        </div>
      </div>
    </div>
  );
}
