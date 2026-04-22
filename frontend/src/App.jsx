import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRequests from "./pages/AdminRequests";
import CreateEvent from "./pages/CreateEvent";
import ProtectedRoute from "./components/ProtectedRoute";
import EventDetails from "./pages/EventDetails";
import Events from "./pages/Events";
import Login from "./pages/Login";
import MyBookings from "./pages/MyBookings";
import MyEvents from "./pages/MyEvents";
import Register from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/my-bookings" element={<MyBookings />} />
      </Route>

      <Route element={<ProtectedRoute roles={["organizer"]} />}>
        <Route
          path="/create-event"
          element={
            <div className="min-h-screen bg-slate-100 px-4 py-8">
              <div className="mx-auto max-w-3xl">
                <CreateEvent />
              </div>
            </div>
          }
        />
        <Route path="/my-events" element={<MyEvents />} />
      </Route>

      <Route element={<ProtectedRoute roles={["admin"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
