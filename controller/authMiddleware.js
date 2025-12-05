const JWT = require("jsonwebtoken");
const authMiddleware = (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
  } // authheader format: Bearer token

  if (!token)
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    // decoded = { _id: ..., iat: ..., exp: ... }
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(400).json({ success: false, message: "Invalid or expired token" });
  }
};
module.exports = authMiddleware;  