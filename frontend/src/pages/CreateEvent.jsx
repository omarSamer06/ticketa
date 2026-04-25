import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const emptyForm = {
  title: "",
  description: "",
  image: "",
  date: "",
  location: "",
  price: "",
  totalTickets: "",
};

function toDateInputValue(date) {
  if (!date) return "";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "";
  return parsedDate.toISOString().slice(0, 16);
}

function buildInitialForm(initialValues) {
  if (!initialValues) return emptyForm;
  return {
    title: initialValues.title || "",
    description: initialValues.description || "",
    image: initialValues.image || "",
    date: toDateInputValue(initialValues.date),
    location: initialValues.location || "",
    price: initialValues.price ?? "",
    totalTickets: initialValues.totalTickets ?? "",
  };
}

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20";

const labelClass = "mb-1.5 block text-xs font-medium text-gray-500";

export default function CreateEvent({
  initialValues = null,
  onSubmit,
  onCancel,
  submitLabel = "Create Event",
  title = "Create Event",
}) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => buildInitialForm(initialValues));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field, value) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      date: form.date,
      location: form.location.trim(),
      price: Number(form.price),
      totalTickets: Number(form.totalTickets),
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        await api.post("/api/events", payload);
        navigate("/my-events", { replace: true });
      }
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to save event";
      const fieldErrors = err?.response?.data?.data?.errors;
      const details = fieldErrors ? Object.values(fieldErrors).join(", ") : "";
      setError(details ? `${message}: ${details}` : message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const card = (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">Fill in the details below to publish your event.</p>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div>
          <label htmlFor="title" className={labelClass}>Title</label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className={inputClass}
            placeholder="Event title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>Description</label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            className={`${inputClass} min-h-28 resize-y`}
            placeholder="Describe your event"
            required
          />
        </div>

        <div>
          <label htmlFor="image" className={labelClass}>
            Image URL{" "}
            <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="image"
            type="url"
            value={form.image}
            onChange={(e) => updateField("image", e.target.value)}
            className={inputClass}
            placeholder="https://example.com/event-image.jpg"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="date" className={labelClass}>Date &amp; Time</label>
            <input
              id="date"
              type="datetime-local"
              value={form.date}
              onChange={(e) => updateField("date", e.target.value)}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label htmlFor="location" className={labelClass}>Location</label>
            <input
              id="location"
              type="text"
              value={form.location}
              onChange={(e) => updateField("location", e.target.value)}
              className={inputClass}
              placeholder="Venue or city"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="price" className={labelClass}>Price (USD)</label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => updateField("price", e.target.value)}
              className={inputClass}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label htmlFor="totalTickets" className={labelClass}>Total Tickets</label>
            <input
              id="totalTickets"
              type="number"
              min="1"
              value={form.totalTickets}
              onChange={(e) => updateField("totalTickets", e.target.value)}
              className={inputClass}
              placeholder="100"
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </span>
            ) : submitLabel}
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );

  // When used as a standalone page (no onSubmit prop), wrap with page padding + header
  if (!onSubmit && !onCancel) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create Event</h1>
          <p className="mt-1 text-sm text-gray-500">Publish a new event for attendees to discover and book.</p>
        </div>
        <div className="max-w-2xl">
          {card}
        </div>
      </div>
    );
  }

  return card;
}
