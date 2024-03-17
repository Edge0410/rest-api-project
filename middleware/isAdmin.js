// isAdmin middleware
const isAdmin = (req, res, next) => {
  // Check if req.user.role is Admin
  if (req.user && req.user.role === "Admin") {
    // If the user is an admin, proceed to the next middleware
    next();
  } else {
    // If the user is not an admin, return a 403 Forbidden response
    res.status(403).json({ error: "Unauthorized: User is not an admin" });
  }
};

module.exports = isAdmin;
