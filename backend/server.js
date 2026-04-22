const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

const CLIENT_URL = process.env.CLIENT_URL;

if (!CLIENT_URL) {
  throw new Error("Missing required env var: CLIENT_URL");
}

// ✅ CORS FIRST
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://webapp1-weld.vercel.app"
  ],
  credentials: true
}));

// 🔥 ADD THIS LINE (THIS IS YOUR MISSING PIECE)
app.options("*", cors());

// ✅ THEN body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes
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

app.get("/", (_req, res) => {
  res.status(200).json({ message: "OK" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

const PORT = Number(process.env.PORT) || 3000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function start() {
  if (!MONGO_URI) {
    throw new Error("Missing required env var: MONGO_URI");
  }

  await mongoose.connect(MONGO_URI);

  app.listen(PORT, () => {
    if (process.env.NODE_ENV !== "production") {
      console.info(`API listening on port ${PORT}`);
    }
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exitCode = 1;
});