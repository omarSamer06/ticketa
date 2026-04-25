import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [cancelingId, setCancelingId] = useState("");

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">My Bookings</h1>
          <p className="mt-1 text-sm text-gray-500">Track your tickets and spending.</p>
        </div>
        <Link
          to="/events"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-95"
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
            { label: "Total Bookings", value: dashboardStats.totalBookings, icon: "📋", iconBg: "bg-blue-100", numColor: "text-blue-700" },
            { label: "Tickets Booked", value: dashboardStats.totalTickets, icon: "🎫", iconBg: "bg-indigo-100", numColor: "text-indigo-700" },
            { label: "Money Spent", value: formatPrice(dashboardStats.totalSpent), icon: "💸", iconBg: "bg-violet-100", numColor: "text-violet-700" },
            { label: "Active", value: dashboardStats.activeBookings, icon: "✅", iconBg: "bg-green-100", numColor: "text-green-700" },
            { label: "Canceled", value: dashboardStats.canceledBookings, icon: "❌", iconBg: "bg-red-100", numColor: "text-red-600" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl text-lg ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{stat.label}</p>
              <p className={`mt-1 text-2xl font-bold ${stat.numColor}`}>{stat.value}</p>
            </div>
          ))}
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
          <Link
            to="/events"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95"
          >
            Browse Events
          </Link>
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
                className="overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Colored top stripe */}
                <div className={`h-1.5 w-full ${booking.status === "canceled" ? "bg-gradient-to-r from-red-400 to-red-500" : "bg-gradient-to-r from-green-400 to-emerald-500"}`} />
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
