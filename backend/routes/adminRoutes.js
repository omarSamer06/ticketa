const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/test", authMiddleware, authorizeRoles("admin"), (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Admin route OK",
    data: { user: req.user },
  });
});

module.exports = router;

