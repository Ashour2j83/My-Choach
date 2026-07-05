import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, userData, loading } = useAuth();

  if (loading) return null;

  // مش عامل Login
  if (!user) return <Navigate to="/login" replace />;

  // الإيميل مش متفعل
  if (!user.emailVerified) return <Navigate to="/login" replace />;

  // User عادي حاول يدخل صفحة الأدمن
  if (adminOnly && userData?.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}