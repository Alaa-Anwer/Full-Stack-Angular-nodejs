import { verifyToken } from "../utils/tokenUtils.js";
import AppError from "../utils/AppError.js";
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError(
          "No token provided. Please login first.",
          401,
          "UNAUTHORIZED",
        ),
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(
        new AppError(
          "No token provided. Please login first.",
          401,
          "UNAUTHORIZED",
        ),
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return next(
        new AppError("Invalid or expired token.", 401, "UNAUTHORIZED"),
      );
    }


    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError("Authentication failed.", 401, "UNAUTHORIZED"));
  }
};

export default authMiddleware;
