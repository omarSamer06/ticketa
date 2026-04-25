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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (roles?.length && !roles.includes(user?.role)) {
    const requiredRoles = roles.join(" or ");
    const article = /^[aeiou]/i.test(requiredRoles) ? "an" : "a";

    return (
      <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100">
        <Navbar />
        <main className="flex flex-1 items-center justify-center pt-14 lg:ml-64 lg:pt-0">
          <div className="mx-auto max-w-md rounded-2xl border border-white/40 bg-white/80 p-10 text-center shadow-md backdrop-blur">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
              🔒
            </div>
            <h1 className="mt-5 text-xl font-semibold text-gray-900">Access Denied</h1>
            <p className="mt-2 text-sm text-gray-500">
              You need {article}{" "}
              <span className="font-medium text-gray-700">{requiredRoles}</span>{" "}
              account to view this page.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100">
      <Navbar />
      <main className="flex-1 pt-14 lg:ml-64 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
