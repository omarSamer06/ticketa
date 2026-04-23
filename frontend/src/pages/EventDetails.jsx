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

  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function EventImage({ image, title }) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl bg-slate-200 text-sm font-medium text-slate-500">
        No image available
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={title}
      className="h-72 w-full rounded-2xl object-cover"
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

    return () => {
      isActive = false;
    };
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
      await api.post("/api/bookings", {
        eventId: id,
        numberOfTickets,
      });

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
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link to="/events" className="text-sm font-medium text-slate-700 underline">
          Back to events
        </Link>

        {status === "loading" ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            Loading event details...
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : null}

        {status === "success" && event ? (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
            <EventImage image={event.image} title={event.title} />
            <div className="mt-6 border-b border-slate-200 pb-6">
              <h1 className="text-3xl font-bold text-slate-900">{event.title}</h1>
              <p className="mt-3 text-slate-600">{event.description}</p>
            </div>

            <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="font-medium text-slate-900">Date</dt>
                <dd className="mt-1 text-slate-600">{formatDate(event.date)}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="font-medium text-slate-900">Location</dt>
                <dd className="mt-1 text-slate-600">{event.location}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="font-medium text-slate-900">Price</dt>
                <dd className="mt-1 text-slate-600">{formatPrice(event.price)}</dd>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <dt className="font-medium text-slate-900">Remaining Tickets</dt>
                <dd className="mt-1 text-slate-600">{event.remainingTickets}</dd>
              </div>
            </dl>

            <div className="mt-8 rounded-2xl border border-slate-200 p-5">
              {Number(event.remainingTickets) === 0 ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  Sold Out
                </div>
              ) : (
                <>
                  {Number(event.remainingTickets) < 5 ? (
                    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-800">
                      Only {event.remainingTickets} ticket{Number(event.remainingTickets) === 1 ? "" : "s"} left!
                    </div>
                  ) : null}
                  <label
                    htmlFor="tickets"
                    className="block text-sm font-medium text-slate-900"
                  >
                    Number of tickets
                  </label>
                  <input
                    id="tickets"
                    type="number"
                    min="1"
                    max={event.remainingTickets}
                    value={tickets}
                    onChange={(inputEvent) => setTickets(inputEvent.target.value)}
                    className="mt-2 w-full max-w-xs rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
                  />
                  {bookingError ? (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {bookingError}
                    </div>
                  ) : null}
                  {bookingSuccess ? (
                    <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {bookingSuccess}
                    </div>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleBooking}
                    disabled={bookingStatus === "submitting"}
                    className="mt-4 rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {bookingStatus === "submitting" ? "Booking..." : "Book Now"}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
