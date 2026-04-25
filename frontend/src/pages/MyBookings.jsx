import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

function formatPrice(price) {
  const amount = Number(price);
  if (Number.isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(amount);
}

function formatDate(date) {
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(date));
}

function BookingStatusBadge({ status }) {
  if (status === "canceled") {
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
        Canceled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
      Confirmed
    </span>
  );
}

function RequestStatusBadge({ status }) {
  const map = {
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function MyBookings() {
  const { updateUser, user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState("");
  const [organizerRequestStatus, setOrganizerRequestStatus] = useState("idle");
  const [organizerMessage, setOrganizerMessage] = useState("");
  const [organizerReason, setOrganizerReason] = useState("");

  const dashboardStats = bookings.reduce(
    (stats, booking) => {
      const isCanceled = booking.status === "canceled";
      const tickets = Number(booking.numberOfTickets) || 0;
      const totalPrice = Number(booking.totalPrice) || 0;
      return {
        totalBookings: stats.totalBookings + 1,
        totalTickets: stats.totalTickets + tickets,
        totalSpent: stats.totalSpent + totalPrice,
        activeBookings: stats.activeBookings + (booking.status === "confirmed" ? 1 : 0),
        canceledBookings: stats.canceledBookings + (isCanceled ? 1 : 0),
      };
    },
    { totalBookings: 0, totalTickets: 0, totalSpent: 0, activeBookings: 0, canceledBookings: 0 }
  );

  useEffect(() => {
    let isActive = true;

    async function fetchBookings() {
      try {
        const response = await api.get("/api/bookings/my");
        const nextBookings = response?.data?.data?.bookings || [];
        if (isActive) {
          setBookings(nextBookings);
          setStatus("success");
        }
      } catch (err) {
        if (isActive) {
          setError(err?.response?.data?.message || "Failed to load bookings");
          setStatus("error");
        }
      }
    }

    fetchBookings();
    return () => { isActive = false; };
  }, []);

  async function cancelBooking(bookingId) {
    setError("");
    setCancelingId(bookingId);

    try {
      const response = await api.put(`/api/bookings/${bookingId}/cancel`);
      const updatedBooking = response?.data?.data?.booking;
      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking.id === bookingId
            ? { ...booking, ...(updatedBooking || {}), status: "canceled" }
            : booking
        )
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to cancel booking");
    } finally {
      setCancelingId("");
    }
  }

  async function requestOrganizer() {
    setOrganizerMessage("");
    if (!organizerReason.trim()) {
      setOrganizerMessage("Please explain why you want to be an organizer.");
      return;
    }
    setOrganizerRequestStatus("submitting");
    try {
      const response = await api.post("/api/users/request-organizer", { reason: organizerReason });
      const updatedUser = response?.data?.data?.user;
      if (updatedUser) updateUser(updatedUser);
      setOrganizerMessage("Request sent. Awaiting approval.");
      setOrganizerReason("");
    } catch (err) {
      setOrganizerMessage(err?.response?.data?.message || "Failed to send organizer request");
    } finally {
      setOrganizerRequestStatus("idle");
    }
  }

  const requestStatus = user?.organizerRequestStatus || "none";
  const canRequestOrganizer = user?.role === "user" && ["none", "rejected"].includes(requestStatus);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">Track your tickets and spending.</p>
        </div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Browse Events
        </Link>
      </div>

      {/* Stats */}
      {status === "success" ? (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { label: "Total Bookings", value: dashboardStats.totalBookings, color: "text-gray-900" },
            { label: "Tickets Booked", value: dashboardStats.totalTickets, color: "text-gray-900" },
            { label: "Money Spent", value: formatPrice(dashboardStats.totalSpent), color: "text-blue-600" },
            { label: "Active", value: dashboardStats.activeBookings, color: "text-green-600" },
            { label: "Canceled", value: dashboardStats.canceledBookings, color: "text-red-500" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{stat.label}</p>
              <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {/* Organizer request panel */}
      {user?.role === "user" ? (
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Become an Organizer</h2>
              <p className="mt-1 text-xs text-gray-500">Apply to publish and manage your own events.</p>
            </div>
            <RequestStatusBadge status={requestStatus} />
          </div>

          {canRequestOrganizer ? (
            <div className="mt-4">
              <label htmlFor="organizerReason" className="mb-1.5 block text-xs font-medium text-gray-500">
                Why do you want to be an organizer?
              </label>
              <textarea
                id="organizerReason"
                value={organizerReason}
                onChange={(e) => setOrganizerReason(e.target.value)}
                className="min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                placeholder="Share your event plans or experience."
              />
              <button
                type="button"
                onClick={requestOrganizer}
                disabled={organizerRequestStatus === "submitting"}
                className="mt-3 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {organizerRequestStatus === "submitting" ? "Sending…" : "Submit Request"}
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-gray-500">
              {requestStatus === "pending"
                ? "Your request is pending admin review."
                : requestStatus === "approved"
                  ? "Your organizer request has been approved."
                  : "Organizer requests are unavailable for your account."}
            </p>
          )}
        </div>
      ) : null}

      {/* Feedback messages */}
      {organizerMessage ? (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {organizerMessage}
        </div>
      ) : null}

      {/* Loading */}
      {status === "loading" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-3/4 rounded bg-gray-100" />
              <div className="mt-3 h-3 w-1/2 rounded bg-gray-100" />
              <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Error */}
      {error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Empty state */}
      {status === "success" && bookings.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">🎫</div>
          <p className="mt-4 text-base font-medium text-gray-900">No bookings yet</p>
          <p className="mt-1 text-sm text-gray-500">Browse events and book your first ticket.</p>
        </div>
      ) : null}

      {/* Bookings list */}
      {status === "success" && bookings.length > 0 ? (
        <div>
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Your Bookings</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className={`rounded-2xl border-l-4 bg-white shadow-sm ${
                  booking.status === "canceled" ? "border-l-red-400" : "border-l-green-500"
                }`}
              >
                <div className="flex h-full flex-col justify-between gap-4 p-5">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {booking.event?.title || "Event unavailable"}
                      </h3>
                      <BookingStatusBadge status={booking.status} />
                    </div>

                    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Tickets</dt>
                        <dd className="mt-1 font-semibold text-gray-900">{booking.numberOfTickets}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Price</dt>
                        <dd className="mt-1 font-semibold text-blue-600">{formatPrice(booking.totalPrice)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Booked On</dt>
                        <dd className="mt-1 text-xs text-gray-500">{formatDate(booking.createdAt)}</dd>
                      </div>
                    </dl>
                  </div>

                  <button
                    type="button"
                    onClick={() => cancelBooking(booking.id)}
                    disabled={booking.status === "canceled" || cancelingId === booking.id}
                    className="w-fit rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancelingId === booking.id ? "Canceling…" : "Cancel Booking"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
