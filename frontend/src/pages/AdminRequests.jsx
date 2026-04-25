import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminRequests() {
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [approvingId, setApprovingId] = useState("");
  const [rejectingId, setRejectingId] = useState("");

  useEffect(() => {
    let isActive = true;

    async function fetchRequests() {
      try {
        const response = await api.get("/api/users/organizer-requests");
        const nextUsers = response?.data?.data?.users || [];
        if (isActive) {
          setUsers(nextUsers);
          setStatus("success");
        }
      } catch (err) {
        if (isActive) {
          setError(err?.response?.data?.message || "Failed to load organizer requests");
          setStatus("error");
        }
      }
    }

    fetchRequests();
    return () => { isActive = false; };
  }, []);

  async function approveUser(userId) {
    setError(""); setSuccess(""); setApprovingId(userId);
    try {
      await api.put(`/api/users/${userId}/approve-organizer`);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
      setSuccess("Organizer request approved.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve request");
    } finally {
      setApprovingId("");
    }
  }

  async function rejectUser(userId) {
    setError(""); setSuccess(""); setRejectingId(userId);
    try {
      await api.put(`/api/users/${userId}/reject-organizer`);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
      setSuccess("Organizer request rejected.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject request");
    } finally {
      setRejectingId("");
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Organizer Requests</h1>
        <p className="mt-1 text-sm text-gray-500">Review and action pending organizer applications.</p>
      </div>

      {/* Feedback */}
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
      ) : null}

      {/* Loading skeletons */}
      {status === "loading" ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-1/3 rounded bg-gray-100" />
              <div className="mt-2 h-3 w-1/4 rounded bg-gray-100" />
              <div className="mt-3 h-12 rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Empty state */}
      {status === "success" && users.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-3xl">✅</div>
          <p className="mt-4 text-base font-medium text-gray-900">No pending requests</p>
          <p className="mt-1 text-sm text-gray-500">All organizer requests have been reviewed.</p>
        </div>
      ) : null}

      {/* Request cards */}
      {status === "success" && users.length > 0 ? (
        <div className="grid gap-4">
          {users.map((user) => (
            <article
              key={user.id}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-gray-900">{user.name}</h2>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-gray-50 p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Reason</p>
                    <p className="mt-1 text-sm text-gray-700 leading-relaxed">
                      {user.organizerRequestReason || "No reason provided."}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => approveUser(user.id)}
                    disabled={approvingId === user.id || rejectingId === user.id}
                    className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {approvingId === user.id ? "Approving…" : "Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectUser(user.id)}
                    disabled={approvingId === user.id || rejectingId === user.id}
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {rejectingId === user.id ? "Rejecting…" : "Reject"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
