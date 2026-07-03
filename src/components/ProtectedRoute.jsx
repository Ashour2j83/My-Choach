import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, userData, loading } = useAuth();

  if (loading) return null;

  // مش logged in
  if (!user) return <Navigate to="/login" replace />;

  // email مش verified → login
  if (!user.emailVerified) return <Navigate to="/login" replace />;

  // admin route بس user عادي بيدخله
  if (adminOnly && userData?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // user بيحاول يدخل /admin
  if (!adminOnly && userData?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}