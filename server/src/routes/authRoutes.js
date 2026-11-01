import express from "express";

import {
  registerUser,
  loginUser,
  logoutUser,
} from "../controllers/authController.js";

import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/authValidator.js";

const router = express.Router();

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
};

// Register a new user
router.post("/register", validate(registerSchema), registerUser);

// Login user
router.post("/login", validate(loginSchema), loginUser);

// Logout user
router.post("/logout", authenticate, logoutUser);

// Get currently logged-in user
router.get("/me", authenticate, (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});

// Admin-only test route
router.get(
  "/admin",
  authenticate,
  authorizeRoles("admin"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Welcome Admin! You have access to this route.",
    });
  }
);

export default router;