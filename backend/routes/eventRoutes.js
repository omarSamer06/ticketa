const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  getEventAnalytics,
} = require("../controllers/eventController");

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("organizer"), createEvent);
router.get("/", getAllEvents);
router.get("/:id/analytics", authMiddleware, authorizeRoles("organizer", "admin"), getEventAnalytics);
router.get("/:id", getSingleEvent);
router.put("/:id", authMiddleware, updateEvent);
router.delete("/:id", authMiddleware, deleteEvent);

module.exports = router;

