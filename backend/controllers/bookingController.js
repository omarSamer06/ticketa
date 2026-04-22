const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Event = require("../models/Event");

function json(res, status, message, data = null) {
  return res.status(status).json({ success: status < 400, message, data });
}

function formatError(err) {
  if (err && err.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).reduce((acc, e) => {
      if (e && e.path) acc[e.path] = e.message || "Invalid value";
      return acc;
    }, {});
    return { status: 400, message: "Validation failed", data: { errors } };
  }

  return {
    status: 500,
    message: err instanceof Error && err.message ? err.message : "Server error",
    data: null,
  };
}

async function createBooking(req, res) {
  const session = await mongoose.startSession();
  try {
    const { eventId, numberOfTickets } = req.body || {};

    const qty = Number(numberOfTickets);
    if (!eventId || !mongoose.isValidObjectId(eventId)) {
      return json(res, 400, "Invalid eventId", null);
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return json(res, 400, "numberOfTickets must be > 0", null);
    }

    let booking;

    // Use a transaction if available (replica set / Atlas). This prevents ticket
    // decrement without a corresponding booking record.
    await session.withTransaction(async () => {
      const event = await Event.findOneAndUpdate(
        { _id: eventId, remainingTickets: { $gte: qty } },
        { $inc: { remainingTickets: -qty } },
        { new: true, session }
      );

      if (!event) {
        const exists = await Event.exists({ _id: eventId }).session(session);
        if (!exists) {
          booking = null;
          throw Object.assign(new Error("Event not found"), { statusCode: 404 });
        }
        booking = null;
        throw Object.assign(new Error("Not enough tickets remaining"), {
          statusCode: 400,
        });
      }

      const totalPrice = Number(event.price) * qty;

      booking = await Booking.create(
        [
          {
            user: req.user._id,
            event: event._id,
            numberOfTickets: qty,
            totalPrice,
            status: "confirmed",
          },
        ],
        { session }
      );
      booking = booking[0];
    });

    // Populate for nicer response (no sensitive fields on User).
    await booking.populate([
      { path: "event" },
      { path: "user" },
    ]);

    return json(res, 201, "Booking created", { booking });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("createBooking error:", {
      message: err && err.message,
      stack: err && err.stack,
      error: err,
    });

    if (err && err.statusCode) {
      return json(res, err.statusCode, err.message, null);
    }

    const f = formatError(err);
    return json(res, f.status, f.message, f.data);
  } finally {
    session.endSession();
  }
}

async function getMyBookings(req, res) {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate([{ path: "event" }]);

    return json(res, 200, "Bookings fetched", { bookings });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("getMyBookings error:", {
      message: err && err.message,
      stack: err && err.stack,
      error: err,
    });
    const f = formatError(err);
    return json(res, f.status, f.message, f.data);
  }
}

async function cancelBooking(req, res) {
  const session = await mongoose.startSession();
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return json(res, 400, "Invalid booking id", null);
    }

    let canceled;

    await session.withTransaction(async () => {
      const booking = await Booking.findById(id).session(session);
      if (!booking) {
        throw Object.assign(new Error("Booking not found"), { statusCode: 404 });
      }

      const isAdmin = req.user.role === "admin";
      const isOwner =
        booking.user && booking.user.toString() === req.user._id.toString();
      if (!isAdmin && !isOwner) {
        throw Object.assign(new Error("Forbidden"), { statusCode: 403 });
      }

      if (booking.status === "canceled") {
        throw Object.assign(new Error("Booking already canceled"), {
          statusCode: 400,
        });
      }

      const qty = Number(booking.numberOfTickets) || 0;
      if (qty <= 0) {
        throw Object.assign(new Error("Invalid booking ticket count"), {
          statusCode: 500,
        });
      }

      // Restore tickets safely (never negative; this is an increment).
      await Event.updateOne(
        { _id: booking.event },
        { $inc: { remainingTickets: qty } },
        { session }
      );

      booking.status = "canceled";
      await booking.save({ session });
      canceled = booking;
    });

    await canceled.populate([{ path: "event" }, { path: "user" }]);
    return json(res, 200, "Booking canceled", { booking: canceled });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("cancelBooking error:", {
      message: err && err.message,
      stack: err && err.stack,
      error: err,
    });

    if (err && err.statusCode) {
      return json(res, err.statusCode, err.message, null);
    }

    const f = formatError(err);
    return json(res, f.status, f.message, f.data);
  } finally {
    session.endSession();
  }
}

module.exports = { createBooking, getMyBookings, cancelBooking };

