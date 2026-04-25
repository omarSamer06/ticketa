import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../services/api";

function formatDate(date) {
  if (!date) return "Date unavailable";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(date));
}

function formatPrice(price) {
  const amount = Number(price);
  if (Number.isNaN(amount)) return "Price unavailable";
  if (amount === 0) return "Free";
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(amount);
}

function EventImage({ image, title }) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-5xl">
        🗓
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={title}
      className="h-64 w-full rounded-2xl object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState(1);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [bookingStatus, setBookingStatus] = useState("idle");
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  useEffect(() => {
    let isActive = true;

    async function fetchEvent() {
      try {
        const response = await api.get(`/api/events/${id}`);
        const nextEvent = response?.data?.data?.event;
        if (isActive) {
          setEvent(nextEvent || null);
          setStatus(nextEvent ? "success" : "error");
          setError(nextEvent ? "" : "Event not found");
        }
      } catch (err) {
        if (isActive) {
          setError(err?.response?.data?.message || "Failed to load event");
          setStatus("error");
        }
      }
    }

    fetchEvent();
    return () => { isActive = false; };
  }, [id]);

  async function handleBooking() {
    const numberOfTickets = Number(tickets);

    setBookingError("");
    setBookingSuccess("");

    if (!Number.isInteger(numberOfTickets) || numberOfTickets <= 0) {
      setBookingError("Please enter a valid number of tickets.");
      return;
    }

    if (event && numberOfTickets > Number(event.remainingTickets)) {
      setBookingError("Not enough tickets remaining.");
      return;
    }

    setBookingStatus("submitting");

    try {
      await api.post("/api/bookings", { eventId: id, numberOfTickets });

      setEvent((currentEvent) =>
        currentEvent
          ? {
              ...currentEvent,
              remainingTickets: Math.max(
                0,
                Number(currentEvent.remainingTickets) - numberOfTickets
              ),
            }
          : currentEvent
      );
      setBookingSuccess("Booking confirmed successfully.");
      setTickets(1);
    } catch (err) {
      setBookingError(err?.response?.data?.message || "Booking failed");
    } finally {
      setBookingStatus("idle");
    }
  }

  return (
    <div className="p-6">
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to events
      </Link>

      {/* Loading skeleton */}
      {status === "loading" ? (
        <div className="mt-6 animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="h-64 rounded-2xl bg-gray-100" />
          <div className="mt-6 h-6 w-2/3 rounded bg-gray-100" />
          <div className="mt-2 h-4 w-full rounded bg-gray-100" />
          <div className="mt-1 h-4 w-3/4 rounded bg-gray-100" />
        </div>
      ) : null}

      {/* Error */}
      {status === "error" ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Content */}
      {status === "success" && event ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Main column */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <EventImage image={event.image} title={event.title} />
              <h1 className="mt-6 text-2xl font-semibold text-gray-900">{event.title}</h1>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">{event.description}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Date & Time",
                    value: formatDate(event.date),
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Location",
                    value: event.location,
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Price",
                    value: formatPrice(event.price),
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ),
                  },
                  {
                    label: "Remaining Tickets",
                    value: event.remainingTickets,
                    icon: (
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
                    <span className="mt-0.5 text-blue-500">{item.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-gray-400">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-gray-800">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking sidebar */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-gray-900">Reserve tickets</h2>

              {Number(event.remainingTickets) === 0 ? (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
                  <p className="text-sm font-semibold text-red-600">Sold Out</p>
                  <p className="mt-1 text-xs text-red-400">No tickets available</p>
                </div>
              ) : (
                <>
                  {Number(event.remainingTickets) < 5 ? (
                    <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-medium text-orange-700">
                      ⚡ Only {event.remainingTickets} ticket{Number(event.remainingTickets) === 1 ? "" : "s"} left!
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <label htmlFor="tickets" className="mb-1.5 block text-xs font-medium text-gray-500">
                      Number of tickets
                    </label>
                    <input
                      id="tickets"
                      type="number"
                      min="1"
                      max={event.remainingTickets}
                      value={tickets}
                      onChange={(e) => setTickets(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
                    />
                  </div>

                  {bookingError ? (
                    <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {bookingError}
                    </div>
                  ) : null}
                  {bookingSuccess ? (
                    <div className="mt-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                      {bookingSuccess}
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={bookingStatus === "submitting"}
                    className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {bookingStatus === "submitting" ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Booking…
                      </span>
                    ) : "Book Now"}
                  </button>

                  <p className="mt-3 text-center text-xs text-gray-400">
                    {formatPrice(event.price)} per ticket
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
