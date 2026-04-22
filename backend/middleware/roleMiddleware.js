function authorizeRoles(...roles) {
  const allowed = new Set(roles);

  return function roleMiddleware(req, res, next) {
    const role = req.user && req.user.role;
    if (!role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        data: null,
      });
    }

    if (!allowed.has(role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        data: null,
      });
    }

    return next();
  };
}

module.exports = { authorizeRoles };

