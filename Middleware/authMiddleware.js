// Middleware example (authMiddleware.js)
import jwt from "jsonwebtoken";
import User from "../Models/AdminUser.js";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log(authHeader);
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "Nweewdfdqvdwqw");
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
