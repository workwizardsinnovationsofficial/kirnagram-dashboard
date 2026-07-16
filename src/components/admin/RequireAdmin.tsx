import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { getAuthenticatedAgent } from "@/lib/agentAuth";

const RequireAdmin = () => {
  const location = useLocation();
  const isAdmin = isAdminAuthenticated();
  const agent = getAuthenticatedAgent();

  if (!isAdmin && !agent) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
