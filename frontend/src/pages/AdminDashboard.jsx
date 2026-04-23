import { useEffect, useState } from "react";
import api from "../services/api";

const roles = ["user", "organizer", "admin"];

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function getOrganizerLabel(event) {
  if (!event?.organizer) return "Unknown organizer";
  if (typeof event.organizer === "string") return event.organizer;

  return event.organizer.name || event.organizer.email || "Unknown organizer";
}

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  approved: "bg-green-100 text-green-800 border border-green-200",
  rejected: "bg-red-100 text-red-800 border border-red-200",
};

function StatusBadge({ status }) {
  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600"}`}
    >
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

    return () => {
      isActive = false;
    };
  }, []);

  async function updateRole(userId, role) {
    setError("");
    setSuccess("");
    setUpdatingUserId(userId);

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
    const confirmed = window.confirm("Delete this user? This action cannot be undone.");
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingUserId(userId);

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
    const confirmed = window.confirm("Delete this event? This action cannot be undone.");
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingEventId(eventId);

    try {
      await api.delete(`/api/events/${eventId}`);
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== eventId)
      );
      setSuccess("Event deleted.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete event");
    } finally {
      setDeletingEventId("");
    }
  }

  async function approveEvent(eventId) {
    setError("");
    setSuccess("");
    setApprovingEventId(eventId);

    try {
      const response = await api.put(`/api/admin/events/${eventId}/approve`);
      const updatedEvent = response?.data?.data?.event;
      if (updatedEvent) {
        setEvents((current) =>
          current.map((e) => (e.id === eventId ? { ...e, status: "approved" } : e))
        );
      }
      setSuccess("Event approved.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve event");
    } finally {
      setApprovingEventId("");
    }
  }

  async function rejectEvent(eventId) {
    setError("");
    setSuccess("");
    setRejectingEventId(eventId);

    try {
      const response = await api.put(`/api/admin/events/${eventId}/reject`);
      const updatedEvent = response?.data?.data?.event;
      if (updatedEvent) {
        setEvents((current) =>
          current.map((e) => (e.id === eventId ? { ...e, status: "rejected" } : e))
        );
      }
      setSuccess("Event rejected.");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject event");
    } finally {
      setRejectingEventId("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-slate-600">
            Manage users, roles, and events from one place.
          </p>
        </div>

        {status === "loading" ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            Loading admin dashboard...
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

        {status === "success" ? (
          <div className="mt-6 grid gap-6">
            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Users Management
                  </h2>
                  <p className="text-slate-600">Update roles or remove users.</p>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {users.length} users
                </span>
              </div>

              {users.length === 0 ? (
                <p className="mt-6 text-slate-600">No users found.</p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                    <thead>
                      <tr className="text-slate-500">
                        <th className="py-3 pr-4 font-semibold">Name</th>
                        <th className="py-3 pr-4 font-semibold">Email</th>
                        <th className="py-3 pr-4 font-semibold">Role</th>
                        <th className="py-3 pr-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((user) => (
                        <tr key={user.id} className="align-middle">
                          <td className="py-4 pr-4 font-medium text-slate-900">
                            {user.name}
                          </td>
                          <td className="py-4 pr-4 text-slate-600">{user.email}</td>
                          <td className="py-4 pr-4">
                            <select
                              value={user.role}
                              onChange={(event) =>
                                updateRole(user.id, event.target.value)
                              }
                              disabled={updatingUserId === user.id}
                              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 outline-none transition focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {roles.map((role) => (
                                <option key={role} value={role}>
                                  {role}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 pr-4">
                            <button
                              type="button"
                              onClick={() => deleteUser(user.id)}
                              disabled={deletingUserId === user.id}
                              className="rounded-lg border border-red-200 px-3 py-2 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {deletingUserId === user.id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Events Management
                  </h2>
                  <p className="text-slate-600">Approve, reject, or delete events.</p>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {events.length} events
                </span>
              </div>

              {events.length === 0 ? (
                <p className="mt-6 text-slate-600">No events found.</p>
              ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {events.map((event) => (
                    <article
                      key={event.id}
                      className="rounded-2xl border border-slate-200 p-5"
                    >
                      <div className="flex h-full flex-col justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-xl font-semibold text-slate-900">
                              {event.title}
                            </h3>
                            <StatusBadge status={event.status} />
                          </div>
                          <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                            <div>
                              <dt className="font-medium text-slate-900">
                                Organizer
                              </dt>
                              <dd>{getOrganizerLabel(event)}</dd>
                            </div>
                            <div>
                              <dt className="font-medium text-slate-900">Date</dt>
                              <dd>{formatDate(event.date)}</dd>
                            </div>
                          </dl>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => approveEvent(event.id)}
                            disabled={
                              approvingEventId === event.id ||
                              rejectingEventId === event.id ||
                              event.status === "approved"
                            }
                            className="rounded-lg border border-green-200 px-3 py-2 text-sm font-medium text-green-700 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {approvingEventId === event.id ? "Approving..." : "Approve"}
                          </button>
                          <button
                            type="button"
                            onClick={() => rejectEvent(event.id)}
                            disabled={
                              approvingEventId === event.id ||
                              rejectingEventId === event.id ||
                              event.status === "rejected"
                            }
                            className="rounded-lg border border-orange-200 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {rejectingEventId === event.id ? "Rejecting..." : "Reject"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteEvent(event.id)}
                            disabled={deletingEventId === event.id}
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingEventId === event.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
