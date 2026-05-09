import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hook/useAuth";
import { ROUTES } from "../../constant/routes";

export default function RequireAuth() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <Outlet />;
}
