import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "rounded-lg px-3 py-2 text-sm font-medium transition",
          isActive
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  async function handleLogout() {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Logout endpoint failure should not block client-side logout
    }
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link to="/events" className="text-lg font-bold text-slate-900">
          Ticketing
        </Link>
        <nav className="flex flex-wrap items-center gap-2">
          <NavItem to="/events">Events</NavItem>
          <NavItem to="/my-bookings">My Bookings</NavItem>
          {user?.role === "organizer" ? (
            <>
              <NavItem to="/my-events">My Events</NavItem>
              <NavItem to="/create-event">Create Event</NavItem>
            </>
          ) : null}
          {user?.role === "admin" ? (
            <>
              <NavItem to="/admin">Admin</NavItem>
              <NavItem to="/admin/requests">Organizer Requests</NavItem>
            </>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
