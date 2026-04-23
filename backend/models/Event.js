const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title must be at most 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [5000, "Description must be at most 5000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [300, "Location must be at most 300 characters"],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, "Category must be at most 100 characters"],
    },
    image: {
      type: String,
      trim: true,
      maxlength: [2048, "Image URL must be at most 2048 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be >= 0"],
    },
    totalTickets: {
      type: Number,
      required: [true, "Total tickets is required"],
      min: [1, "Total tickets must be >= 1"],
    },
    remainingTickets: {
      type: Number,
      required: [true, "Remaining tickets is required"],
      min: [0, "Remaining tickets must be >= 0"],
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

eventSchema.pre("validate", function () {
  if (this.isNew && (this.remainingTickets === undefined || this.remainingTickets === null)) {
    this.remainingTickets = this.totalTickets;
  }
});

eventSchema.index({ title: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ date: 1 });

eventSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  return obj;
};

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);
module.exports = Event;

