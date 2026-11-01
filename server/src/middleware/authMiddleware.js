
import jwt from "jsonwebtoken";
import { isTokenRevoked } from "../models/tokenModel.js";

const authenticate = async (req, res, next) => {
  try {
    // 1. Get Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    // 3. Verify JWT
    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET,
        { algorithms: ["HS256"] }
      );
    } catch (error) {
      return res.status(401).json({
        success: false,
        message:
          error.name === "TokenExpiredError"
            ? "Token has expired"
            : "Invalid token",
      });
    }

    // 4. Ensure token has a unique identifier
    if (!decoded.jti) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: missing token ID",
      });
    }

    // 5. Check whether token was revoked
    const revoked = await isTokenRevoked(decoded.jti);

    if (revoked) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please log in again.",
      });
    }

    // 6. Attach user information
    req.user = decoded;

    // 7. Continue
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
