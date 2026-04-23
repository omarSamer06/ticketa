const express = require("express");
const { register, login } = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Current user",
    data: { user: req.user },
  });
});

router.post("/logout", (req, res) => {
  return res.status(200).json({ success: true, message: "Logged out successfully", data: null });
});

module.exports = router;

