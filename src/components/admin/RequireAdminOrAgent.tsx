import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getAuthenticatedAgent } from "@/lib/agentAuth";

interface RequireAdminProps {
  type: "admin" | "agent";
  requiredPermission?: "prompts" | "ads" | "aiCreatorRequests";
}

const RequireAdminOrAgent = ({ type, requiredPermission }: RequireAdminProps) => {
  const location = useLocation();
  const isAdmin = isAdminAuthenticated();
  const agent = getAuthenticatedAgent();

  if (type === "admin") {
    if (!isAdmin) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } else if (type === "agent") {
    // Admin has access to all pages
    if (isAdmin) {
      return <Outlet />;
    }

    if (!agent) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (requiredPermission && !agent.permissions[requiredPermission]) {
      return <Navigate to="/" state={{ from: location }} replace />;
    }
  }

  return <Outlet />;
};

export default RequireAdminOrAgent;
