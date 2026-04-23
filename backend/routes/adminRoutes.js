const express = require("express");
const mongoose = require("mongoose");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const Event = require("../models/Event");

const router = express.Router();

router.get("/test", authMiddleware, authorizeRoles("admin"), (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin route OK",
    data: { user: req.user },
  });
});

router.get("/events", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const events = await Event.find({})
      .sort({ createdAt: -1 })
      .populate("organizer", "name email role");
    return res.status(200).json({ success: true, total: events.length, data: events });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("admin getEvents error:", err && err.message);
    return res.status(500).json({ success: false, message: "Server error", data: null });
  }
});

router.put("/events/:id/approve", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event id", data: null });
    }
    const event = await Event.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found", data: null });
    }
    return res.status(200).json({ success: true, message: "Event approved", data: { event } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("admin approveEvent error:", err && err.message);
    return res.status(500).json({ success: false, message: "Server error", data: null });
  }
});

router.put("/events/:id/reject", authMiddleware, authorizeRoles("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid event id", data: null });
    }
    const event = await Event.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found", data: null });
    }
    return res.status(200).json({ success: true, message: "Event rejected", data: { event } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("admin rejectEvent error:", err && err.message);
    return res.status(500).json({ success: false, message: "Server error", data: null });
  }
});

module.exports = router;

