import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F3F4F6] antialiased">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-slate-200 border-t-slate-900 mb-5"></div>
        <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[11px]">
          Verifying Secure Access...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" state={{ from: location }} replace />;
  }

  const isChangePasswordRoute = location.pathname === "/change-password";

  if (user?.isFirstLogin && !isChangePasswordRoute) {
    return <Navigate to="/change-password" replace />;
  }

  if (!user?.isFirstLogin && isChangePasswordRoute) {
    return <Navigate to="/" replace />;
  }

  return children;
}