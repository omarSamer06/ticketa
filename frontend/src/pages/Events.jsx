import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  return new Intl.NumberFormat("en", { style: "currency", currency: "USD" }).format(amount);
}

function EventImage({ image, title }) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600">
        <span className="text-5xl opacity-80">🎟</span>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={title}
      className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
      onError={() => setHasError(true)}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="h-40 rounded-xl bg-gray-100" />
      <div className="mt-4 h-4 w-3/4 rounded bg-gray-100" />
      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
      <div className="mt-2 h-3 w-2/3 rounded bg-gray-100" />
      <div className="mt-4 h-9 rounded-lg bg-gray-100" />
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";

export default function Events() {
  const { user } = useAuth();
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
    const titleMatch = event.title?.toLowerCase().includes(search.trim().toLowerCase());
    const categoryMatch = category ? event.category === category : true;
    const locationMatch = event.location?.toLowerCase().includes(location.trim().toLowerCase());
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
    return () => { isActive = false; };
  }, []);

  return (
    <div className="p-6">
      {/* Hero banner */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-8 py-10 text-white shadow-xl">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-36 w-36 translate-y-1/2 rounded-full bg-violet-300/20 blur-2xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
              🎟 Live Events
            </span>
            {user?.name ? (
              <p className="mb-1 text-sm font-medium text-blue-200">
                Hello, {user.name.split(" ")[0]} 👋
              </p>
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight">Discover Amazing Events</h1>
            <p className="mt-2 max-w-md text-sm text-blue-100">
              Browse concerts, workshops, conferences and more. Book your next experience today.
            </p>
          </div>
          <Link
            to="/my-bookings"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur-sm transition-all duration-200 hover:bg-white/30 hover:scale-[1.02] active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2" />
            </svg>
            My Bookings
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm backdrop-blur">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Filter Events</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="mb-1.5 block text-xs font-medium text-gray-600">
              Search
            </label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Concert, workshop…"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="category" className="mb-1.5 block text-xs font-medium text-gray-500">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="location" className="mb-1.5 block text-xs font-medium text-gray-500">
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City or venue"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="date" className="mb-1.5 block text-xs font-medium text-gray-500">
              Date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {status === "error" ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Loading skeletons */}
      {status === "loading" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => <SkeletonCard key={n} />)}
        </div>
      ) : null}

      {/* Empty states */}
      {status === "success" && events.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl shadow-lg">🗓</div>
          <p className="mt-5 text-lg font-semibold text-gray-900">No events yet</p>
          <p className="mt-1 text-sm text-gray-500">Check back soon — great events are coming!</p>
        </div>
      ) : null}

      {status === "success" && events.length > 0 && filteredEvents.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 text-4xl">🔍</div>
          <p className="mt-5 text-lg font-semibold text-gray-900">No events match your filters</p>
          <p className="mt-1 text-sm text-gray-500">Try clearing a filter or searching for something else.</p>
        </div>
      ) : null}

      {/* Events grid */}
      {status === "success" && filteredEvents.length > 0 ? (
        <>
          <p className="mb-4 text-xs font-medium text-gray-400">{filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""} found</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Full-bleed image with overlays */}
                <div className="relative overflow-hidden">
                  <EventImage image={event.image} title={event.title} />

                  {/* Category badge */}
                  {event.category ? (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur-sm">
                      {event.category}
                    </span>
                  ) : null}

                  {/* Sold-out overlay */}
                  {Number(event.remainingTickets) === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 backdrop-blur-[1px]">
                      <span className="rounded-full bg-red-500 px-4 py-1.5 text-sm font-bold tracking-wide text-white shadow-lg">
                        SOLD OUT
                      </span>
                    </div>
                  ) : null}

                  {/* Low-stock ribbon */}
                  {Number(event.remainingTickets) > 0 && Number(event.remainingTickets) < 5 ? (
                    <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white shadow">
                      🔥 {event.remainingTickets} left
                    </span>
                  ) : null}
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-4">
                  <h2 className="text-sm font-bold text-gray-900 leading-snug">{event.title}</h2>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <svg className="h-3.5 w-3.5 shrink-0 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  {/* Price row */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-base font-bold text-blue-600">{formatPrice(event.price)}</span>
                    {Number(event.remainingTickets) > 0 ? (
                      <span className="text-xs text-gray-400">{event.remainingTickets} available</span>
                    ) : null}
                  </div>

                  <Link
                    to={`/events/${event.id}`}
                    className="mt-3 block rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-95"
                  >
                    View Details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
