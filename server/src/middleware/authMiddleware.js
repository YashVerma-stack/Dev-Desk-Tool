import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../models/tokenModel.js";
import { isUserActive } from "../models/userModel.js";

const authenticate = async (req, res, next) => {
  try {
    // Read JWT from HTTP-only cookie
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication cookie is required",
      });
    }

    let decoded;

    // Verify JWT
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"],
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Token has expired"
            : "Invalid token",
      });
    }

    // Check token ID
    if (!decoded.jti) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: missing token ID",
      });
    }

    // Check whether token has been revoked
    const revoked = await isTokenRevoked(decoded.jti);

    if (revoked) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please log in again.",
      });
    }

    // Check whether user account is active
    const active = await isUserActive(decoded.id);

    if (!active) {
      return res.status(401).json({
        success: false,
        message: "Your account is inactive or has been deleted.",
      });
    }

    // Attach authenticated user information
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Authentication middleware error:", error);

    return res.status(503).json({
      success: false,
      message: "Authentication service temporarily unavailable",
    });
  }
};

export default authenticate;