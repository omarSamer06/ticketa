const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getBearerToken(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string") return null;

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

async function authMiddleware(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authorization token missing or invalid",
        data: null,
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      // eslint-disable-next-line no-console
      console.error("Auth middleware misconfigured: missing JWT_SECRET");
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
        data: null,
      });
    }

    const payload = jwt.verify(token, secret);
    const userId = payload && payload.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        data: null,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        data: null,
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("Auth middleware error:", {
      message: err && err.message,
      stack: err && err.stack,
      error: err,
    });

    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
      data: null,
    });
  }
}

module.exports = { authMiddleware };

