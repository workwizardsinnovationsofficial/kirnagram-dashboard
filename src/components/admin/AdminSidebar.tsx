import { FormEvent, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Megaphone,
  Coins,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  changeAdminPassword,
  clearAdminAuthenticated,
  getAuthenticatedAdminRole,
} from "@/lib/adminAuth";
import { clearAgentAuthenticated, getAuthenticatedAgent } from "@/lib/agentAuth";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const agent = getAuthenticatedAgent();
  const adminRole = getAuthenticatedAdminRole();

  const menuItems = [
    { title: "Main", url: "/", icon: LayoutDashboard },
    ...(agent ? [] : [{ title: "Agents", url: "/agents", icon: Bot }]),
    ...(!agent ? [{ title: "Users", url: "/users", icon: Sparkles }] : []),
    ...(agent && agent.permissions.prompts ? [{ title: "Prompts", url: "/prompts", icon: FileText }] : []),
    ...(agent && agent.permissions.prompts ? [{ title: "Approved Prompts", url: "/approved-prompts", icon: CheckCircle }] : []),
    ...(agent && agent.permissions.prompts ? [{ title: "Remix Reviews", url: "/remix-reviews", icon: CheckCircle }] : []),
    ...(agent && agent.permissions.ads ? [{ title: "Ads", url: "/ads", icon: Megaphone }] : []),
    ...(agent && agent.permissions.aiCreatorRequests ? [{ title: "AI Creators", url: "/ai-creators", icon: Sparkles }] : []),
    ...(!agent ? [{ title: "Prompts", url: "/prompts", icon: FileText }] : []),
    ...(!agent ? [{ title: "Approved Prompts", url: "/approved-prompts", icon: CheckCircle }] : []),
    ...(!agent ? [{ title: "Remix Reviews", url: "/remix-reviews", icon: CheckCircle }] : []),
    ...(!agent ? [{ title: "Ads", url: "/ads", icon: Megaphone }] : []),
    ...(!agent ? [{ title: "Withdraw", url: "/currency", icon: Coins }] : []),
    ...(!agent ? [{ title: "Credits Settings", url: "/credits", icon: Coins }] : []),
    ...(!agent ? [{ title: "Creator Bonus", url: "/creator-bonus", icon: Sparkles }] : []),
    ...(!agent ? [{ title: "AI Creators", url: "/ai-creators", icon: Sparkles }] : []),
  ];

  const handleLogout = () => {
    if (agent) {
      clearAgentAuthenticated();
    } else {
      clearAdminAuthenticated();
    }
    navigate("/login", { replace: true });
  };

  const handlePasswordUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);

    if (!adminRole) {
      setPasswordError("Only admins can change password.");
      return;
    }

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Please fill all password fields.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New password and confirm password must match.");
      return;
    }

    const result = await changeAdminPassword(oldPassword, newPassword);
    if (!result.success) {
      setPasswordError(result.message || "Unable to change password.");
      return;
    }

    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setIsPasswordDialogOpen(false);
    toast.success("Password changed successfully.");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-all duration-300 shadow-xl shadow-black/10",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="h-28 flex items-center px-4">
        <p>Kirnagram</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-primary/20 text-sidebar-accent-foreground ring-1 ring-primary/40"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "w-5 h-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-sidebar-muted group-hover:text-primary",
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium whitespace-nowrap transition-all duration-300",
                      collapsed ? "opacity-0 w-0" : "opacity-100",
                    )}
                  >
                    {item.title}
                  </span>
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.title}
                    </div>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {!agent && (
          <button
            onClick={() => {
              setPasswordError(null);
              setIsPasswordDialogOpen(true);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors group"
          >
            <KeyRound className="w-5 h-5 text-sidebar-muted group-hover:text-primary" />
            <span
              className={cn(
                "text-sm font-medium whitespace-nowrap transition-all duration-300",
                collapsed ? "opacity-0 w-0" : "opacity-100",
              )}
            >
              Change Password
            </span>
            {collapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                Change Password
              </div>
            )}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors group"
        >
          <LogOut className="w-5 h-5 text-sidebar-muted group-hover:text-primary" />
          <span
            className={cn(
              "text-sm font-medium whitespace-nowrap transition-all duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100",
            )}
          >
            Logout
          </span>
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors border border-sidebar-border/70"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Collapse</span>
            </>
          )}
        </button>
      </div>

      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Change Admin Password</DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePasswordUpdate} className="space-y-3">
            <Input
              type="password"
              placeholder="Old password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              required
            />
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              autoComplete="new-password"
              required
            />

            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Password</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
