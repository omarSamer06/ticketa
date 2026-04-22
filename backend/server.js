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

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://webapp1-weld.vercel.app"
  ],
  credentials: true
}));

// ✅ Handle preflight properly WITHOUT wildcard route
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    return res.sendStatus(200);
  }
  next();
});

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