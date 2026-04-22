import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Navbar from "./Navbar";

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, isLoadingUser, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 text-slate-600">
        Loading...
      </div>
    );
  }

  if (roles?.length && !roles.includes(user?.role)) {
    const requiredRoles = roles.join(" or ");
    const article = /^[aeiou]/i.test(requiredRoles) ? "an" : "a";

    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-slate-100 px-4 py-8">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Access denied</h1>
            <p className="mt-2 text-slate-600">
              You need {article} {requiredRoles} account to access this page.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
