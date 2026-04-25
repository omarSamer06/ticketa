import { useEffect, useState } from "react";
import api from "../services/api";

const roles = ["user", "organizer", "admin"];

function formatDate(date) {
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

function getOrganizerLabel(event) {
  if (!event?.organizer) return "Unknown organizer";
  if (typeof event.organizer === "string") return event.organizer;
  return event.organizer.name || event.organizer.email || "Unknown organizer";
}

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function StatusBadge({ status }) {
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] || "bg-gray-100 text-gray-500"}`}>
      {label}
    </span>
  );
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [deletingEventId, setDeletingEventId] = useState("");
  const [approvingEventId, setApprovingEventId] = useState("");
  const [rejectingEventId, setRejectingEventId] = useState("");

  useEffect(() => {
    let isActive = true;

    async function fetchAdminData() {
      try {
        const [usersResponse, eventsResponse] = await Promise.all([
          api.get("/api/users"),
          api.get("/api/admin/events"),
        ]);
        if (isActive) {
          setUsers(usersResponse?.data?.data?.users || []);
          setEvents(eventsResponse?.data?.data || []);
          setStatus("success");
        }
      } catch (err) {
        if (isActive) {
          setError(err?.response?.data?.message || "Failed to load admin data");
          setStatus("error");
        }
      }
    }

    fetchAdminData();
    return () => { isActive = false; };
  }, []);

  async function updateRole(userId, role) {
    setError(""); setSuccess(""); setUpdatingUserId(userId);
    try {
      const response = await api.put(`/api/users/${userId}/role`, { role });
      const updatedUser = response?.data?.data?.user;
      if (updatedUser) {
        setUsers((currentUsers) =>
          currentUsers.map((user) => (user.id === userId ? updatedUser : user))
        );
      }
      setSuccess("User role updated.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update user role");
    } finally {
      setUpdatingUserId("");
    }
  }

  async function deleteUser(userId) {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    setError(""); setSuccess(""); setDeletingUserId(userId);
    try {
      await api.delete(`/api/users/${userId}`);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
      setSuccess("User deleted.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingUserId("");
    }
  }

  async function deleteEvent(eventId) {
    if (!window.confirm("Delete this event? This action cannot be undone.")) return;
    setError(""); setSuccess(""); setDeletingEventId(eventId);
    try {
      await api.delete(`/api/events/${eventId}`);
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
      setSuccess("Event deleted.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete event");
    } finally {
      setDeletingEventId("");
    }
  }

  async function approveEvent(eventId) {
    setError(""); setSuccess(""); setApprovingEventId(eventId);
    try {
      await api.put(`/api/admin/events/${eventId}/approve`);
      setEvents((current) =>
        current.map((e) => (e.id === eventId ? { ...e, status: "approved" } : e))
      );
      setSuccess("Event approved.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve event");
    } finally {
      setApprovingEventId("");
    }
  }

  async function rejectEvent(eventId) {
    setError(""); setSuccess(""); setRejectingEventId(eventId);
    try {
      await api.put(`/api/admin/events/${eventId}/reject`);
      setEvents((current) =>
        current.map((e) => (e.id === eventId ? { ...e, status: "rejected" } : e))
      );
      setSuccess("Event rejected.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject event");
    } finally {
      setRejectingEventId("");
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Manage users, roles, and events from one place.</p>
      </div>

      {/* Loading */}
      {status === "loading" ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div key={n} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="h-5 w-1/4 rounded bg-gray-100" />
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((m) => (
                  <div key={m} className="h-4 rounded bg-gray-100" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Feedback */}
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}
      {success ? (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>
      ) : null}

      {status === "success" ? (
        <div className="space-y-8">
          {/* Users table */}
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 text-base text-white shadow-sm">
                  👥
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Users</h2>
                  <p className="text-xs text-gray-500">Update roles or remove users.</p>
                </div>
              </div>
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                {users.length}
              </span>
            </div>

            {users.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wide text-gray-400">
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50">
                        <td className="px-6 py-3.5 font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-3.5 text-gray-500">{user.email}</td>
                        <td className="px-6 py-3.5">
                          <select
                            value={user.role}
                            onChange={(e) => updateRole(user.id, e.target.value)}
                            disabled={updatingUserId === user.id}
                            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-3.5">
                          <button
                            type="button"
                            onClick={() => deleteUser(user.id)}
                            disabled={deletingUserId === user.id}
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingUserId === user.id ? "Deleting…" : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Events section */}
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-base text-white shadow-sm">
                  🎟
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Events</h2>
                  <p className="text-xs text-gray-500">Approve, reject, or delete events.</p>
                </div>
              </div>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {events.length}
              </span>
            </div>

            {events.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm font-medium text-gray-500">No events to review</p>
                <p className="mt-1 text-xs text-gray-400">Events submitted by organizers will appear here.</p>
              </div>
            ) : (
              <div className="grid gap-4 p-6 lg:grid-cols-2">
                {events.map((event) => (
                  <article key={event.id} className="rounded-xl border border-gray-100 p-4 transition-shadow hover:shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug truncate">{event.title}</h3>
                          <StatusBadge status={event.status} />
                        </div>
                        <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
                          <div>
                            <dt className="inline font-medium text-gray-400">Organizer: </dt>
                            <dd className="inline">{getOrganizerLabel(event)}</dd>
                          </div>
                          <div>
                            <dt className="inline font-medium text-gray-400">Date: </dt>
                            <dd className="inline">{formatDate(event.date)}</dd>
                          </div>
                        </dl>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => approveEvent(event.id)}
                        disabled={approvingEventId === event.id || rejectingEventId === event.id || event.status === "approved"}
                        className="rounded-lg bg-green-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {approvingEventId === event.id ? "Approving…" : "Approve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectEvent(event.id)}
                        disabled={approvingEventId === event.id || rejectingEventId === event.id || event.status === "rejected"}
                        className="rounded-lg border border-orange-200 px-3 py-1.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {rejectingEventId === event.id ? "Rejecting…" : "Reject"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEvent(event.id)}
                        disabled={deletingEventId === event.id}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingEventId === event.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
