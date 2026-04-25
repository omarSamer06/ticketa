import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function Profile() {
  const { user } = useAuth();
  const requestStatus = user?.organizerRequestStatus || "none";

  const statusBadge = {
    pending: <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">Pending</span>,
    approved: <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Approved</span>,
    rejected: <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Rejected</span>,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">View your account details and manage your role.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — avatar card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-md backdrop-blur">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-3xl font-bold text-white shadow-md">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">{user?.name}</h2>
              <p className="mt-0.5 text-sm text-gray-500">{user?.email}</p>
              <span className="mt-3 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                {user?.role}
              </span>
            </div>

            {/* Detail rows */}
            <div className="mt-6 space-y-3 border-t border-gray-100 pt-5 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">Name</span>
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">Email</span>
                <span className="break-all text-gray-700">{user?.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">Role</span>
                <span className="capitalize text-gray-700">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — role panels */}
        <div className="space-y-6 lg:col-span-2">

          {/* Become Organizer — link card for regular users */}
          {user?.role === "user" ? (
            <div className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-md backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Become an Organizer</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Apply to create and manage your own events on the platform.
                  </p>
                </div>
                {requestStatus !== "none" ? statusBadge[requestStatus] : null}
              </div>

              <Link
                to="/apply-organizer"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                {requestStatus === "none" || requestStatus === "rejected" ? "Apply Now" : "View Application Status"}
              </Link>
            </div>
          ) : null}

          {/* Account status for organizer / admin */}
          {user?.role !== "user" ? (
            <div className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-md backdrop-blur">
              <h2 className="text-lg font-medium text-gray-900">Account Status</h2>
              <p className="mt-2 text-sm text-gray-500">
                {user?.role === "organizer"
                  ? "You are an approved organizer. Use the sidebar to create and manage your events."
                  : "You have administrator access. You can manage all users and events."}
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-blue-50 px-4 py-3">
                <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium capitalize text-blue-700">{user?.role} account — active</span>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}
