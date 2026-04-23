import { useEffect, useState } from "react";
import CreateEvent from "./CreateEvent";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatPrice(price) {
  const amount = Number(price);

  if (Number.isNaN(amount)) return "Price unavailable";
  if (amount === 0) return "Free";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(amount);
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
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600"}`}
    >
      {label}
    </span>
  );
}

function AnalyticsBar({ analytics }) {
  if (!analytics) {
    return (
      <p className="mt-1 text-xs text-slate-400">Loading analytics...</p>
    );
  }
  const { totalTickets, bookedTickets, percentageBooked } = analytics;
  return (
    <div className="mt-3">
      <p className="text-xs text-slate-600">
        Booked:{" "}
        <span className="font-semibold text-slate-800">
          {bookedTickets} / {totalTickets}
        </span>{" "}
        &mdash; {percentageBooked}%
      </p>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-700 transition-all"
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

        // Fetch analytics for each event in the background
        organizerEvents.forEach(async (event) => {
          try {
            const analyticsResponse = await api.get(`/api/events/${event.id}/analytics`);
            const data = analyticsResponse?.data?.data;
            if (isActive && data) {
              setAnalyticsMap((prev) => ({ ...prev, [event.id]: data }));
            }
          } catch {
            // Analytics fetch failure is non-critical
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

    return () => {
      isActive = false;
    };
  }, [user?.id]);

  async function updateEvent(payload) {
    const response = await api.put(`/api/events/${editingEvent.id}`, payload);
    const updatedEvent = response?.data?.data?.event;

    if (updatedEvent) {
      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    }

    setEditingEvent(null);
  }

  async function deleteEvent(eventId) {
    setError("");
    setDeleteId(eventId);

    try {
      await api.delete(`/api/events/${eventId}`);
      setEvents((currentEvents) =>
        currentEvents.filter((event) => event.id !== eventId)
      );
      if (editingEvent?.id === eventId) {
        setEditingEvent(null);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to delete event");
    } finally {
      setDeleteId("");
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">My Events</h1>
          <p className="mt-1 text-slate-600">
            Manage the events you have created as an organizer.
          </p>
        </div>

        {status === "loading" ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            Loading your events...
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : null}

        {editingEvent ? (
          <div className="mt-6">
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

        {status === "success" && events.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            You have not created any events yet.
          </div>
        ) : null}

        {status === "success" && events.length > 0 ? (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {events.map((event) => (
              <article key={event.id} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold text-slate-900">
                        {event.title}
                      </h2>
                      <StatusBadge status={event.status} />
                    </div>
                    <dl className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-slate-900">Date</dt>
                        <dd>{formatDate(event.date)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-900">Location</dt>
                        <dd>{event.location}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-900">Price</dt>
                        <dd>{formatPrice(event.price)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-900">Remaining</dt>
                        <dd>{event.remainingTickets}</dd>
                      </div>
                    </dl>
                    <AnalyticsBar analytics={analyticsMap[event.id]} />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(event)}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEvent(event.id)}
                      disabled={deleteId === event.id}
                      className="rounded-lg border border-red-200 px-4 py-2 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleteId === event.id ? "Deleting..." : "Delete"}
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
