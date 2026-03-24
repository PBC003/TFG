import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { LoadingScreen } from "../common/LoadingScreen";
import type { Role } from "../../types/auth.ts";

interface RequireRoleProps {
  allowedRoles: Role[];
}

export function RequireRole({ allowedRoles }: RequireRoleProps) {
  const auth = useAuth();

  if (auth.status === "loading") {
    return <LoadingScreen />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (!auth.user || !allowedRoles.includes(auth.user.role)) {
    return <Navigate to={ROUTES.unauthorized} replace />;
  }

  return <Outlet />;
}
