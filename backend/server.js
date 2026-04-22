const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const CLIENT_URL = process.env.CLIENT_URL;

if (!CLIENT_URL) {
  throw new Error("Missing required env var: CLIENT_URL");
}

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://your-app.vercel.app"
  ],
  credentials: true
}));
app.options("*", cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
      // eslint-disable-next-line no-console
      console.info(`API listening on port ${PORT}`);
    }
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exitCode = 1;
});
