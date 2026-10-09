import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, isAdmin } from "../utils/auth.js";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
}
