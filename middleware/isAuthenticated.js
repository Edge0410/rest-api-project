const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  // We extract the request header to get the token if exists
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Token format: "Bearer <token>"
  // Swagger format: <token>
  const [, accessToken] = token.split(" ");

  jwt.verify(accessToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = decoded;
    next();
  });
};

module.exports = isAuthenticated;
