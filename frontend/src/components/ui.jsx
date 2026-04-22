export const pageHeader =
  "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200";

export const card =
  "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200";

export const input =
  "w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export const select =
  "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-70";

export const primaryButton =
  "rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70";

export const secondaryButton =
  "rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60";

export const dangerButton =
  "rounded-lg border border-red-200 px-4 py-2 font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

export function Alert({ children, type = "error" }) {
  const styles =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`rounded-2xl border p-5 ${styles}`}>
      {children}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
      {children}
    </div>
  );
}

export function LoadingState({ children = "Loading..." }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center text-slate-600 shadow-sm ring-1 ring-slate-200">
      {children}
    </div>
  );
}
