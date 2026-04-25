import { useEffect, useState } from "react";
import CreateEvent from "./CreateEvent";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

function formatDate(date) {
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

function formatPrice(price) {
  const amount = Number(price);
  if (Number.isNaN(amount)) return "Price unavailable";
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(amount);
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

function AnalyticsBar({ analytics }) {
  if (!analytics) {
    return <div className="mt-3 h-2 animate-pulse rounded-full bg-gray-100" />;
  }
  const { totalTickets, bookedTickets, percentageBooked } = analytics;
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Booked: <span className="font-semibold text-gray-700">{bookedTickets} / {totalTickets}</span></span>
        <span className="font-medium text-blue-600">{percentageBooked}%</span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${Math.min(percentageBooked, 100)}%` }}
        />
      </div>
    </div>
  );
}

export default function MyEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [analyticsMap, setAnalyticsMap] = useState({});

  useEffect(() => {
    let isActive = true;

    async function fetchEvents() {
      try {
        const response = await api.get("/api/events/mine?limit=100");
        const organizerEvents = response?.data?.data || [];

        if (isActive) {
          setEvents(organizerEvents);
          setStatus("success");
        }

        organizerEvents.forEach(async (event) => {
          try {
            const analyticsResponse = await api.get(`/api/events/${event.id}/analytics`);
            const data = analyticsResponse?.data?.data;
            if (isActive && data) {
              setAnalyticsMap((prev) => ({ ...prev, [event.id]: data }));
            }
          } catch {
            // non-critical
          }
        });
      } catch (err) {
        if (isActive) {
          setError(err?.response?.data?.message || "Failed to load your events");
          setStatus("error");
        }
      }
    }

    fetchEvents();
    return () => { isActive = false; };
  }, [user?.id]);

  async function updateEvent(payload) {
    const response = await api.put(`/api/events/${editingEvent.id}`, payload);
    const updatedEvent = response?.data?.data?.event;
    if (updatedEvent) {
      setEvents((currentEvents) =>
        currentEvents.map((event) => event.id === updatedEvent.id ? updatedEvent : event)
      );
    }
    setEditingEvent(null);
  }

  async function deleteEvent(eventId) {
    setError("");
    setDeleteId(eventId);
    try {
      await api.delete(`/api/events/${eventId}`);
      setEvents((currentEvents) => currentEvents.filter((event) => event.id !== eventId));
      if (editingEvent?.id === eventId) setEditingEvent(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleteId("");
    }
  }

  return (
    <div className="p-6">
      {/* Hero */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-7 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-32 translate-y-1/2 rounded-full bg-purple-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-indigo-200">⭐ Organizer Hub</p>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Hey {user?.name?.split(" ")[0] || "Organizer"}, here are your events
            </h1>
            <p className="mt-1.5 max-w-sm text-sm text-indigo-100">
              Create, manage, and track analytics for all your events.
            </p>
          </div>
          <a
            href="/create-event"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-600 shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create Event
          </a>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Edit form */}
      {editingEvent ? (
        <div className="mb-6">
          <CreateEvent
            key={editingEvent.id}
            initialValues={editingEvent}
            onSubmit={updateEvent}
            onCancel={() => setEditingEvent(null)}
            submitLabel="Update Event"
            title="Edit Event"
          />
        </div>
      ) : null}

      {/* Loading skeletons */}
      {status === "loading" ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="h-4 w-3/4 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
              <div className="mt-3 h-2 rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Empty state */}
      {status === "success" && events.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl">📋</div>
          <p className="mt-4 text-base font-medium text-gray-900">No events yet</p>
          <p className="mt-1 text-sm text-gray-500">Create your first event to get started.</p>
          <a
            href="/create-event"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create your first event
          </a>
        </div>
      ) : null}

      {/* Events grid */}
      {status === "success" && events.length > 0 ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-sm font-semibold text-gray-900 leading-snug">{event.title}</h2>
                      <StatusBadge status={event.status} />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(event)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEvent(event.id)}
                      disabled={deleteId === event.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleteId === event.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>

                <dl className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                  <div>
                    <dt className="font-medium uppercase tracking-wide text-gray-400">Date</dt>
                    <dd className="mt-0.5 text-gray-700">{formatDate(event.date)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium uppercase tracking-wide text-gray-400">Location</dt>
                    <dd className="mt-0.5 truncate text-gray-700">{event.location}</dd>
                  </div>
                  <div>
                    <dt className="font-medium uppercase tracking-wide text-gray-400">Price</dt>
                    <dd className="mt-0.5 font-semibold text-blue-600">{formatPrice(event.price)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium uppercase tracking-wide text-gray-400">Remaining</dt>
                    <dd className="mt-0.5 text-gray-700">{event.remainingTickets}</dd>
                  </div>
                </dl>

                <AnalyticsBar analytics={analyticsMap[event.id]} />
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
