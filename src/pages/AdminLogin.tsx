import { FormEvent, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isAdminAuthenticated,
  setAdminAuthenticated,
  loginAdmin,
} from "@/lib/adminAuth";
import {
  validateAgentCredentials,
  isAgentAuthenticated,
  setAgentAuthenticated,
} from "@/lib/agentAuth";
import { toast } from "sonner";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAdminAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (isAgentAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname || "/";
  }, [location.state]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // 1. Try admin login (superadmin hardcoded + Firebase Auth)
      const adminRole = await loginAdmin(email, password);
      if (adminRole) {
        setAdminAuthenticated(adminRole);
        setIsLoading(false);
        navigate(redirectPath, { replace: true });
        return;
      }

      // 2. Try agent login (validated against Firestore)
      const agent = await validateAgentCredentials(email, password);
      if (agent) {
        setAgentAuthenticated(agent.id, {
          id: agent.id,
          username: agent.username,
          permissions: agent.permissions,
        });
        toast.success(`Welcome, ${agent.username}!`);
        setIsLoading(false);
        navigate(redirectPath, { replace: true });
        return;
      }

      setError("Invalid email or password.");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-bold">Dashboard Login</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to continue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email / Username</label>
            <Input
              type="text"
              placeholder="Enter username or email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
