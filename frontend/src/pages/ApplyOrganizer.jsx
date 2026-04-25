import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

export default function ApplyOrganizer() {
  const { user, updateUser } = useAuth();
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("");

  const requestStatus = user?.organizerRequestStatus || "none";
  const canApply = ["none", "rejected"].includes(requestStatus);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!reason.trim()) {
      setMessage("Please explain why you want to become an organizer.");
      return;
    }

    setSubmitStatus("submitting");
    try {
      const response = await api.post("/api/users/request-organizer", { reason: reason.trim() });
      const updatedUser = response?.data?.data?.user;
      if (updatedUser) updateUser(updatedUser);
      setMessage("Your request has been submitted. An admin will review it shortly.");
      setReason("");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to send request. Please try again.");
    } finally {
      setSubmitStatus("idle");
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Become an Event Organizer</h1>
        <p className="mt-1 text-sm text-gray-500">
          Request access to create and manage your own events on the platform.
        </p>
      </div>

      <div className="max-w-2xl">

        {/* Status card — shown when request already made */}
        {requestStatus === "pending" ? (
          <div className="rounded-2xl border border-yellow-200 bg-yellow-50/80 p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-xl">
                ⏳
              </div>
              <div>
                <h2 className="text-base font-semibold text-yellow-900">Request Pending</h2>
                <p className="mt-1 text-sm text-yellow-700">
                  Your organizer application is under review. You will be notified once an admin has
                  made a decision.
                </p>
              </div>
            </div>
          </div>
        ) : requestStatus === "approved" ? (
          <div className="rounded-2xl border border-green-200 bg-green-50/80 p-6 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl">
                ✅
              </div>
              <div>
                <h2 className="text-base font-semibold text-green-900">You are an Organizer!</h2>
                <p className="mt-1 text-sm text-green-700">
                  Your request was approved. You can now create and manage events.
                </p>
                <Link
                  to="/my-events"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Go to My Events
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Application form — shown for none or rejected */
          <div className="rounded-2xl border border-gray-100 bg-white/90 p-6 shadow-md backdrop-blur">
            {/* Rejected notice */}
            {requestStatus === "rejected" ? (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm font-medium text-red-700">Your previous request was rejected.</p>
                <p className="mt-0.5 text-xs text-red-500">
                  You may submit a new application below.
                </p>
              </div>
            ) : null}

            <h2 className="text-lg font-medium text-gray-900">Why do you want to organise events?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Tell us about your plans, experience, or the type of events you'd like to run.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label
                  htmlFor="reason"
                  className="mb-1.5 block text-xs font-medium text-gray-500"
                >
                  Your reason
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  disabled={!canApply}
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
                  placeholder="e.g. I run community music events and want to manage ticketing in one place."
                />
              </div>

              {message ? (
                <div className={`rounded-xl border px-4 py-3 text-sm ${
                  message.startsWith("Your request has been")
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }`}>
                  {message}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={submitStatus === "submitting" || !canApply}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitStatus === "submitting" ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting…
                    </>
                  ) : "Apply Now"}
                </button>
                <span className="text-xs text-gray-400">
                  An admin will review your request manually.
                </span>
              </div>
            </form>
          </div>
        )}

        {/* What happens next */}
        {requestStatus === "none" || requestStatus === "rejected" ? (
          <div className="mt-6 rounded-2xl border border-gray-100 bg-white/90 p-5 shadow-sm backdrop-blur">
            <h3 className="text-sm font-semibold text-gray-700">What happens after you apply?</h3>
            <ol className="mt-3 space-y-2 text-sm text-gray-500">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">1</span>
                Your request is sent to an admin for review.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">2</span>
                Admin approves or rejects your application.
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">3</span>
                Once approved, you can start creating and publishing events.
              </li>
            </ol>
          </div>
        ) : null}

      </div>
    </div>
  );
}
