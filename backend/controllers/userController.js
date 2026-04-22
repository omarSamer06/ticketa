const mongoose = require("mongoose");
const User = require("../models/User");

function json(res, status, message, data = null) {
  return res.status(status).json({ success: status < 400, message, data });
}

async function requestOrganizer(req, res) {
  try {
    const { reason } = req.body || {};

    if (req.user.role === "organizer") {
      return json(res, 400, "User is already an organizer", null);
    }

    if (req.user.organizerRequestStatus === "pending") {
      return json(res, 400, "Organizer request is already pending", null);
    }

    if (!reason || !String(reason).trim()) {
      return json(res, 400, "Organizer request reason is required", null);
    }

    req.user.isOrganizerRequested = true;
    req.user.organizerRequestStatus = "pending";
    req.user.organizerRequestReason = String(reason).trim();
    await req.user.save();

    return json(res, 200, "Request sent. Awaiting approval.", {
      user: req.user,
    });
  } catch (err) {
    return json(
      res,
      500,
      err instanceof Error && err.message ? err.message : "Server error",
      null
    );
  }
}

async function getAllUsers(_req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return json(res, 200, "Users fetched", { users });
  } catch (err) {
    return json(
      res,
      500,
      err instanceof Error && err.message ? err.message : "Server error",
      null
    );
  }
}

async function getOrganizerRequests(_req, res) {
  try {
    const users = await User.find({ organizerRequestStatus: "pending" }).sort({
      createdAt: -1,
    });

    return json(res, 200, "Organizer requests fetched", { users });
  } catch (err) {
    return json(
      res,
      500,
      err instanceof Error && err.message ? err.message : "Server error",
      null
    );
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return json(res, 400, "Invalid user id", null);
    }

    if (req.user._id.toString() === id) {
      return json(res, 400, "Admins cannot delete their own account", null);
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return json(res, 404, "User not found", null);
    }

    return json(res, 200, "User deleted", { id });
  } catch (err) {
    return json(
      res,
      500,
      err instanceof Error && err.message ? err.message : "Server error",
      null
    );
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body || {};
    const allowedRoles = new Set(["user", "organizer", "admin"]);

    if (!mongoose.isValidObjectId(id)) {
      return json(res, 400, "Invalid user id", null);
    }

    if (!allowedRoles.has(role)) {
      return json(res, 400, "Role must be user, organizer, or admin", null);
    }

    const user = await User.findById(id);

    if (!user) {
      return json(res, 404, "User not found", null);
    }

    user.role = role;
    if (role === "organizer") {
      user.isOrganizerRequested = false;
      user.organizerRequestStatus = "approved";
    }

    await user.save();

    return json(res, 200, "User role updated", { user });
  } catch (err) {
    return json(
      res,
      500,
      err instanceof Error && err.message ? err.message : "Server error",
      null
    );
  }
}

async function approveOrganizer(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return json(res, 400, "Invalid user id", null);
    }

    const user = await User.findById(id);

    if (!user) {
      return json(res, 404, "User not found", null);
    }

    user.role = "organizer";
    user.isOrganizerRequested = false;
    user.organizerRequestStatus = "approved";
    await user.save();

    return json(res, 200, "Organizer request approved", { user });
  } catch (err) {
    return json(
      res,
      500,
      err instanceof Error && err.message ? err.message : "Server error",
      null
    );
  }
}

async function rejectOrganizer(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return json(res, 400, "Invalid user id", null);
    }

    const user = await User.findById(id);

    if (!user) {
      return json(res, 404, "User not found", null);
    }

    user.isOrganizerRequested = false;
    user.organizerRequestStatus = "rejected";
    await user.save();

    return json(res, 200, "Organizer request rejected", { user });
  } catch (err) {
    return json(
      res,
      500,
      err instanceof Error && err.message ? err.message : "Server error",
      null
    );
  }
}

module.exports = {
  requestOrganizer,
  getAllUsers,
  getOrganizerRequests,
  deleteUser,
  updateUserRole,
  approveOrganizer,
  rejectOrganizer,
};
