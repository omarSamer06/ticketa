import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

function formatPrice(price) {
  const amount = Number(price);

  if (Number.isNaN(amount)) return "$0.00";

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function statusClasses(status) {
  if (status === "canceled") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-green-50 text-green-700 ring-green-200";
}

function statusBorderClasses(status) {
  if (status === "canceled") {
    return "border-l-red-500";
  }

  return "border-l-green-500";
}

function requestStatusClasses(status) {
  if (status === "approved") {
    return "bg-green-50 text-green-700 ring-green-200";
  }

  if (status === "rejected") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  if (status === "pending") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  return "bg-slate-50 text-slate-700 ring-slate-200";
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
    {
      totalBookings: 0,
      totalTickets: 0,
      totalSpent: 0,
      activeBookings: 0,
      canceledBookings: 0,
    }
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

    return () => {
      isActive = false;
    };
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
      const response = await api.post("/api/users/request-organizer", {
        reason: organizerReason,
      });
      const updatedUser = response?.data?.data?.user;

      if (updatedUser) {
        updateUser(updatedUser);
      }

      setOrganizerMessage("Request sent. Awaiting approval.");
      setOrganizerReason("");
    } catch (err) {
      setOrganizerMessage(
        err?.response?.data?.message || "Failed to send organizer request"
      );
    } finally {
      setOrganizerRequestStatus("idle");
    }
  }

  const requestStatus = user?.organizerRequestStatus || "none";
  const canRequestOrganizer =
    user?.role === "user" && ["none", "rejected"].includes(requestStatus);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">User Dashboard</h1>
            <p className="mt-1 text-slate-600">
              Track your bookings, tickets, spending, and cancellations.
            </p>
          </div>
          <Link
            to="/events"
            className="rounded-lg bg-slate-900 px-4 py-2 text-center font-medium text-white transition hover:bg-slate-800"
          >
            Browse Events
          </Link>
        </div>

        {user?.role === "user" ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Become an Organizer
                </h2>
                <p className="mt-1 text-slate-600">
                  Tell admins why you want to publish and manage events.
                </p>
              </div>
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${requestStatusClasses(
                  requestStatus
                )}`}
              >
                {requestStatus}
              </span>
            </div>

            {canRequestOrganizer ? (
              <div className="mt-4">
                <label
                  htmlFor="organizerReason"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Why do you want to be an organizer?
                </label>
                <textarea
                  id="organizerReason"
                  value={organizerReason}
                  onChange={(event) => setOrganizerReason(event.target.value)}
                  className="min-h-28 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  placeholder="Share your event plans, experience, or reason for requesting organizer access."
                />
                <button
                  type="button"
                  onClick={requestOrganizer}
                  disabled={organizerRequestStatus === "submitting"}
                  className="mt-3 rounded-lg border border-slate-300 px-4 py-2 text-center font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {organizerRequestStatus === "submitting"
                    ? "Sending..."
                    : "Submit Request"}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-600">
                {requestStatus === "pending"
                  ? "Your request is pending admin review."
                  : requestStatus === "approved"
                    ? "Your organizer request has been approved."
                    : "Organizer requests are currently unavailable for your account."}
              </p>
            )}
          </div>
        ) : null}

        {organizerMessage ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-slate-700 shadow-sm">
            {organizerMessage}
          </div>
        ) : null}

        {status === "loading" ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            Loading bookings...
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : null}

        {status === "success" ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Bookings</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardStats.totalBookings}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Tickets Booked</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {dashboardStats.totalTickets}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Money Spent</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatPrice(dashboardStats.totalSpent)}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Active</p>
              <p className="mt-2 text-3xl font-bold text-green-700">
                {dashboardStats.activeBookings}
              </p>
            </div>
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Canceled</p>
              <p className="mt-2 text-3xl font-bold text-red-700">
                {dashboardStats.canceledBookings}
              </p>
            </div>
          </div>
        ) : null}

        {status === "success" && bookings.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            You do not have any bookings yet.
          </div>
        ) : null}

        {status === "success" && bookings.length > 0 ? (
          <div className="mt-6">
            <h2 className="text-xl font-bold text-slate-900">Bookings</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {bookings.map((booking) => (
              <article
                key={booking.id}
                className={`rounded-2xl border-l-4 bg-white p-6 shadow-sm ${statusBorderClasses(
                  booking.status
                )}`}
              >
                <div className="flex h-full flex-col justify-between gap-5">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-xl font-semibold text-slate-900">
                      {booking.event?.title || "Event unavailable"}
                      </h3>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${statusClasses(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <dl className="mt-5 grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-slate-900">Tickets</dt>
                        <dd>{booking.numberOfTickets}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-900">Total Price</dt>
                        <dd>{formatPrice(booking.totalPrice)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-900">Booked On</dt>
                        <dd>{formatDate(booking.createdAt)}</dd>
                      </div>
                    </dl>
                  </div>

                  <button
                    type="button"
                    onClick={() => cancelBooking(booking.id)}
                    disabled={booking.status === "canceled" || cancelingId === booking.id}
                    className="rounded-lg border border-red-200 px-4 py-2 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {cancelingId === booking.id ? "Canceling..." : "Cancel Booking"}
                  </button>
                </div>
              </article>
            ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
