const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      set: (v) => v.toLowerCase(),
      validate: {
        validator: (v) => EMAIL_REGEX.test(v),
        message: "Email is invalid",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user",
    },
    isOrganizerRequested: {
      type: Boolean,
      default: false,
    },
    organizerRequestStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    organizerRequestReason: {
      type: String,
      trim: true,
      maxlength: [1000, "Organizer request reason must be at most 1000 characters"],
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;

  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  return obj;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
