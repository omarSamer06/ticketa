const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  createBooking,
  getMyBookings,
  cancelBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createBooking);
router.get("/my", getMyBookings);
router.put("/:id/cancel", cancelBooking);

module.exports = router;

