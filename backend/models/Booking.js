const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    numberOfTickets: {
      type: Number,
      required: [true, "Number of tickets is required"],
      min: [1, "Number of tickets must be >= 1"],
    },
    totalPrice: {
      type: Number,
      min: [0, "Total price must be >= 0"],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

bookingSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  return obj;
};

const Booking =
  mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
module.exports = Booking;

