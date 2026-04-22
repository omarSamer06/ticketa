import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

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

function EventImage({ image, title }) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="flex h-44 items-center justify-center rounded-xl bg-slate-200 text-sm font-medium text-slate-500">
        No image available
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={title}
      className="h-44 w-full rounded-xl object-cover"
      onError={() => setHasError(true)}
    />
  );
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const categories = Array.from(
    new Set(events.map((event) => event.category).filter(Boolean))
  ).sort();

  const filteredEvents = events.filter((event) => {
    const titleMatch = event.title
      ?.toLowerCase()
      .includes(search.trim().toLowerCase());
    const categoryMatch = category ? event.category === category : true;
    const locationMatch = event.location
      ?.toLowerCase()
      .includes(location.trim().toLowerCase());
    const dateMatch = date ? event.date?.slice(0, 10) === date : true;

    return titleMatch && categoryMatch && locationMatch && dateMatch;
  });

  useEffect(() => {
    let isActive = true;

    async function fetchEvents() {
      try {
        const response = await api.get("/api/events?limit=100");
        const nextEvents = response?.data?.data || [];

        if (isActive) {
          setEvents(nextEvents);
          setStatus("success");
        }
      } catch (err) {
        if (isActive) {
          setError(err?.response?.data?.message || "Failed to load events");
          setStatus("error");
        }
      }
    }

    fetchEvents();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Events</h1>
            <p className="mt-1 text-slate-600">Browse available events and view details.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
                Search by title
              </label>
              <input
                id="search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Concert, workshop..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-slate-500"
              >
                <option value="">All categories</option>
                {categories.map((eventCategory) => (
                  <option key={eventCategory} value={eventCategory}>
                    {eventCategory}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or venue"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
                Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>
          </div>
        </div>

        {status === "loading" ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            Loading events...
          </div>
        ) : null}

        {status === "error" ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error}
          </div>
        ) : null}

        {status === "success" && events.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            No events available yet.
          </div>
        ) : null}

        {status === "success" && events.length > 0 && filteredEvents.length === 0 ? (
          <div className="mt-6 rounded-2xl bg-white p-6 text-slate-600 shadow-sm">
            No events match your filters.
          </div>
        ) : null}

        {status === "success" && filteredEvents.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="flex flex-col rounded-2xl bg-white p-6 shadow-sm"
              >
                <EventImage image={event.image} title={event.title} />
                <h2 className="mt-4 text-xl font-semibold text-slate-900">
                  {event.title}
                </h2>
                <dl className="mt-4 space-y-3 text-sm text-slate-600">
                  <div>
                    <dt className="font-medium text-slate-900">Date</dt>
                    <dd>{formatDate(event.date)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-900">Location</dt>
                    <dd>{event.location}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <dt className="font-medium text-slate-900">Price</dt>
                      <dd>{formatPrice(event.price)}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-slate-900">Remaining</dt>
                      <dd>{event.remainingTickets}</dd>
                    </div>
                  </div>
                </dl>
                <Link
                  to={`/events/${event.id}`}
                  className="mt-6 inline-flex justify-center rounded-lg bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800"
                >
                  View Details
                </Link>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
