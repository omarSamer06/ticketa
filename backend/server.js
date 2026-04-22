const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ENV
const CLIENT_URL = process.env.CLIENT_URL;
const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// ✅ SAFE ORIGIN LIST (no crash if env missing)
const allowedOrigins = [
  "http://localhost:5173",
  "https://webapp1-weld.vercel.app",
];

if (CLIENT_URL) {
  allowedOrigins.push(CLIENT_URL);
}

// ✅ CORS CONFIG (robust)
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed"), false);
      }
    },
    credentials: true,
  })
);

// ✅ HANDLE PREFLIGHT REQUESTS
app.options("/*", cors());

// ✅ BODY PARSERS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ROUTES
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const eventRoutes = require("./routes/eventRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/user", userRoutes);
app.use("/api/users", userRoutes);

// HEALTH CHECK
app.get("/", (_req, res) => {
  res.status(200).json({ message: "OK" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

// START SERVER
async function start() {
  if (!MONGO_URI) {
    throw new Error("Missing required env var: MONGO_URI");
  }

  await mongoose.connect(MONGO_URI);

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});