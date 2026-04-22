const jwt = require("jsonwebtoken");
const User = require("../models/User");

function generateToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing required env var: JWT_SECRET");
  }

  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

function jsonResponse(res, status, payload) {
  return res.status(status).json(payload);
}

function formatAuthError(err) {
  // Mongoose validation errors (required/minlength/regex, etc.)
  if (err && err.name === "ValidationError" && err.errors) {
    const errors = Object.values(err.errors).reduce((acc, e) => {
      if (e && e.path) acc[e.path] = e.message || "Invalid value";
      return acc;
    }, {});

    return {
      status: 400,
      payload: {
        success: false,
        message: "Validation failed",
        data: { errors },
      },
    };
  }

  // Duplicate key (unique index), e.g. email already exists.
  if (err && err.code === 11000) {
    const field = err.keyPattern
      ? Object.keys(err.keyPattern)[0]
      : err.keyValue
        ? Object.keys(err.keyValue)[0]
        : "field";

    return {
      status: 409,
      payload: {
        success: false,
        message: "Duplicate value",
        data: { errors: { [field]: `${field} already in use` } },
      },
    };
  }

  // Missing env config (like JWT_SECRET)
  if (err instanceof Error && /Missing required env var:/i.test(err.message)) {
    return {
      status: 500,
      payload: {
        success: false,
        message: err.message,
        data: null,
      },
    };
  }

  return {
    status: 500,
    payload: {
      success: false,
      message: err instanceof Error && err.message ? err.message : "Server error",
      data: null,
    },
  };
}

async function register(req, res) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return jsonResponse(res, 400, {
        success: false,
        message: "name, email, and password are required",
        data: null,
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return jsonResponse(res, 409, {
        success: false,
        message: "User already exists",
        data: null,
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id.toString());

    return jsonResponse(res, 201, {
      success: true,
      message: "Registration successful",
      data: { token, user },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Register error:", {
      message: err && err.message,
      stack: err && err.stack,
      error: err,
    });
    const { status, payload } = formatAuthError(err);
    return jsonResponse(res, status, payload);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return jsonResponse(res, 400, {
        success: false,
        message: "email and password are required",
        data: null,
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return jsonResponse(res, 401, {
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return jsonResponse(res, 401, {
        success: false,
        message: "Invalid credentials",
        data: null,
      });
    }

    const token = generateToken(user._id.toString());

    // Ensure password never leaks even though we selected it for comparison.
    user.password = undefined;

    return jsonResponse(res, 200, {
      success: true,
      message: "Login successful",
      data: { token, user },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Login error:", {
      message: err && err.message,
      stack: err && err.stack,
      error: err,
    });
    const { status, payload } = formatAuthError(err);
    return jsonResponse(res, status, payload);
  }
}

module.exports = { register, login };
