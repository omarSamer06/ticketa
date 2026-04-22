const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  approveOrganizer,
  deleteUser,
  getAllUsers,
  getOrganizerRequests,
  rejectOrganizer,
  requestOrganizer,
  updateUserRole,
} = require("../controllers/userController");

const router = express.Router();

router.get("/", authMiddleware, authorizeRoles("admin"), getAllUsers);
router.post("/request-organizer", authMiddleware, requestOrganizer);
router.get(
  "/organizer-requests",
  authMiddleware,
  authorizeRoles("admin"),
  getOrganizerRequests
);
router.put(
  "/:id/approve-organizer",
  authMiddleware,
  authorizeRoles("admin"),
  approveOrganizer
);
router.put(
  "/:id/reject-organizer",
  authMiddleware,
  authorizeRoles("admin"),
  rejectOrganizer
);
router.put("/:id/role", authMiddleware, authorizeRoles("admin"), updateUserRole);
router.delete("/:id", authMiddleware, authorizeRoles("admin"), deleteUser);

router.get("/test", authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "User route OK",
    data: { user: req.user },
  });
});

module.exports = router;

