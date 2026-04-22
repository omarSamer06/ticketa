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

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-slate-600">
        Fill in the event details below. All fields are required.
      </p>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="min-h-32 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="mb-1 block text-sm font-medium text-slate-700">
            Image URL
          </label>
          <input
            id="image"
            type="url"
            value={form.image}
            onChange={(event) => updateField("image", event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
            placeholder="https://example.com/event-image.jpg"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700">
              Date
            </label>
            <input
              id="date"
              type="datetime-local"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              required
            />
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
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="price" className="mb-1 block text-sm font-medium text-slate-700">
              Price
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateField("price", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="totalTickets"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Total Tickets
            </label>
            <input
              id="totalTickets"
              type="number"
              min="1"
              value={form.totalTickets}
              onChange={(event) => updateField("totalTickets", event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-500"
              required
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-slate-900 px-5 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>
          {onCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-5 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
