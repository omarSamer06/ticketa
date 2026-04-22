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
          setError(
            err?.response?.data?.message || "Failed to load organizer requests"
          );
          setStatus("error");
        }
      }
    }

    fetchRequests();

    return () => {
      isActive = false;
    };
  }, []);

  async function approveUser(userId) {
    setError("");
    setSuccess("");
    setApprovingId(userId);

    try {
      await api.put(`/api/users/${userId}/approve-organizer`);
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId)
      );
      setSuccess("Organizer request approved.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve request");
    } finally {
      setApprovingId("");
    }
  }

  async function rejectUser(userId) {
    setError("");
    setSuccess("");
    setRejectingId(userId);

    try {
      await api.put(`/api/users/${userId}/reject-organizer`);
      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== userId)
      );
      setSuccess("Organizer request rejected.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject request");
    } finally {
      setRejectingId("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">
            Organizer Requests
          </h1>
          <p className="mt-1 text-slate-600">
            Review users waiting for organizer approval.
          </p>
        </div>

        {status === "loading" ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            Loading organizer requests...
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-700">
            {success}
          </div>
        ) : null}

        {status === "success" && users.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            No pending organizer requests.
          </div>
        ) : null}

        {status === "success" && users.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {users.map((user) => (
              <article
                key={user.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {user.name}
                    </h2>
                    <p className="mt-1 text-slate-600">{user.email}</p>
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-900">Reason</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {user.organizerRequestReason || "No reason provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => approveUser(user.id)}
                      disabled={approvingId === user.id || rejectingId === user.id}
                      className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {approvingId === user.id ? "Approving..." : "Approve"}
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectUser(user.id)}
                      disabled={approvingId === user.id || rejectingId === user.id}
                      className="rounded-lg border border-red-200 px-4 py-2 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {rejectingId === user.id ? "Rejecting..." : "Reject"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
