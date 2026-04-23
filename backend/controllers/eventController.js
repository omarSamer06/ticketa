const mongoose = require("mongoose");
const Event = require("../models/Event");
const Booking = require("../models/Booking");

function json(res, status, message, data = null) {
  return res.status(status).json({ success: status < 400, message, data });
}

function formatMongooseError(err) {
  if (err && err.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).reduce((acc, e) => {
      if (e && e.path) acc[e.path] = e.message || "Invalid value";
      return acc;
    }, {});
    return { status: 400, message: "Validation failed", data: { errors } };
  }

  if (err && err.code === 11000) {
    const field = err.keyPattern
      ? Object.keys(err.keyPattern)[0]
      : err.keyValue
        ? Object.keys(err.keyValue)[0]
        : "field";
    return {
      status: 409,
      message: "Duplicate value",
      data: { errors: { [field]: `${field} already in use` } },
    };
  }

  return {
    status: 500,
    message: err instanceof Error && err.message ? err.message : "Server error",
    data: null,
  };
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function createEvent(req, res) {
  try {
    const contentType = req.headers["content-type"];
    const body = req.body || {};

    if (!body || typeof body !== "object" || Object.keys(body).length === 0) {
      // eslint-disable-next-line no-console
      console.error("createEvent: empty body received", {
        contentType,
        hasBody: Boolean(req.body),
      });

      return json(res, 400, "Request body is empty. Send JSON with Content-Type: application/json", {
        receivedContentType: contentType || null,
      });
    }

    const {
      title,
      description,
      date,
      location,
      category,
      image,
      price,
      totalTickets,
    } = body;

    const event = await Event.create({
      title,
      description,
      date,
      location,
      category,
      image,
      price,
      totalTickets,
      remainingTickets: totalTickets,
      organizer: req.user._id,
    });

    return json(res, 201, "Event created", { event });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("createEvent error:", { message: err && err.message, stack: err && err.stack, error: err });
    const f = formatMongooseError(err);
    return json(res, f.status, f.message, f.data);
  }
}

async function getAllEvents(req, res) {
  try {
    const { search, location, date, category, organizer } = req.query || {};
    const page = Math.max(Math.floor(Number(req.query.page)) || 1, 1);
    const limit = Math.max(Math.floor(Number(req.query.limit)) || 10, 1);
    const skip = (page - 1) * limit;
    const filter = { status: "approved" };

    if (search) {
      filter.title = { $regex: escapeRegex(search), $options: "i" };
    }

    if (location) {
      filter.location = { $regex: escapeRegex(location), $options: "i" };
    }

    if (category) {
      filter.category = { $regex: escapeRegex(category), $options: "i" };
    }

    if (organizer && mongoose.isValidObjectId(organizer)) {
      filter.organizer = organizer;
    }

    if (date) {
      const start = new Date(date);

      if (!Number.isNaN(start.getTime())) {
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        filter.date = { $gte: start, $lt: end };
      }
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .populate("organizer", "name email role"),
      Event.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: events,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getAllEvents error:", { message: err && err.message, stack: err && err.stack, error: err });
    const f = formatMongooseError(err);
    return json(res, f.status, f.message, f.data);
  }
}

async function getSingleEvent(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return json(res, 400, "Invalid event id", null);
    }

    const event = await Event.findById(id);
    if (!event) {
      return json(res, 404, "Event not found", null);
    }

    return json(res, 200, "Event fetched", { event });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getSingleEvent error:", { message: err && err.message, stack: err && err.stack, error: err });
    const f = formatMongooseError(err);
    return json(res, f.status, f.message, f.data);
  }
}

async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return json(res, 400, "Invalid event id", null);
    }

    const event = await Event.findById(id);
    if (!event) {
      return json(res, 404, "Event not found", null);
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = event.organizer && event.organizer.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return json(res, 403, "Forbidden", null);
    }

    // Only the organizer who created the event OR an admin can update/delete.
    // If the user isn't an organizer/admin, reject early.
    if (!isAdmin && req.user.role !== "organizer") {
      return json(res, 403, "Forbidden", null);
    }

    const allowedFields = [
      "title",
      "description",
      "date",
      "location",
      "category",
      "image",
      "price",
      "totalTickets",
      "remainingTickets",
    ];

    for (const key of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body || {}, key)) {
        event[key] = req.body[key];
      }
    }

    // If totalTickets is updated and remainingTickets wasn't explicitly set, keep remainingTickets consistent.
    if (
      Object.prototype.hasOwnProperty.call(req.body || {}, "totalTickets") &&
      !Object.prototype.hasOwnProperty.call(req.body || {}, "remainingTickets")
    ) {
      event.remainingTickets = event.totalTickets;
    }

    await event.save();
    return json(res, 200, "Event updated", { event });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("updateEvent error:", { message: err && err.message, stack: err && err.stack, error: err });
    const f = formatMongooseError(err);
    return json(res, f.status, f.message, f.data);
  }
}

async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return json(res, 400, "Invalid event id", null);
    }

    const event = await Event.findById(id);
    if (!event) {
      return json(res, 404, "Event not found", null);
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = event.organizer && event.organizer.toString() === req.user._id.toString();
    if (!isAdmin && !isOwner) {
      return json(res, 403, "Forbidden", null);
    }

    if (!isAdmin && req.user.role !== "organizer") {
      return json(res, 403, "Forbidden", null);
    }

    await event.deleteOne();
    return json(res, 200, "Event deleted", { id });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("deleteEvent error:", { message: err && err.message, stack: err && err.stack, error: err });
    const f = formatMongooseError(err);
    return json(res, f.status, f.message, f.data);
  }
}

async function getMyEvents(req, res) {
  try {
    const organizer = req.user._id;
    const page = Math.max(Math.floor(Number(req.query.page)) || 1, 1);
    const limit = Math.max(Math.floor(Number(req.query.limit)) || 100, 1);
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      Event.find({ organizer }).sort({ date: 1 }).skip(skip).limit(limit),
      Event.countDocuments({ organizer }),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: events,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getMyEvents error:", { message: err && err.message });
    const f = formatMongooseError(err);
    return json(res, f.status, f.message, f.data);
  }
}

async function getEventAnalytics(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return json(res, 400, "Invalid event id", null);
    }

    const event = await Event.findById(id);
    if (!event) {
      return json(res, 404, "Event not found", null);
    }

    const bookings = await Booking.find({ event: id, status: { $ne: "canceled" } });
    const bookedTickets = bookings.reduce((sum, b) => sum + (b.numberOfTickets || 0), 0);
    const totalTickets = event.totalTickets;
    const percentageBooked =
      totalTickets > 0 ? Math.round((bookedTickets / totalTickets) * 100) : 0;

    return json(res, 200, "Analytics fetched", {
      totalTickets,
      bookedTickets,
      percentageBooked,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getEventAnalytics error:", { message: err && err.message });
    const f = formatMongooseError(err);
    return json(res, f.status, f.message, f.data);
  }
}

module.exports = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  getMyEvents,
  getEventAnalytics,
};

