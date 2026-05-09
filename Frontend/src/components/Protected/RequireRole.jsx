import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LOGIN_LINK } from "../../constant/constNavigate";
import { useAuth } from "../../hook/useAuth";

const RequireRole = ({ allowedRoles }) => {
  const { user } = useAuth();

  console.log("==== RequireRole Check ====");
  console.log("User:", user);
  console.log("User role:", user?.role);
  console.log("Allowed roles:", allowedRoles);
  console.log("Role match:", allowedRoles?.includes(user?.role));

  useEffect(() => {
    if (!user) {
      console.log("No user found, redirecting to login link");
      window.location.href = LOGIN_LINK;
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const hasAccess = allowedRoles.includes(user.role);

  if (!hasAccess) {
    console.log("Access denied! Redirecting to unauthorized");
  }

  return hasAccess ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default RequireRole;
