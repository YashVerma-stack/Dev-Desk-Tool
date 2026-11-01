import express from "express";

import {
  getUsers,
  getUser,
  editUser,
  removeUser,
} from "../controllers/userController.js";

import authenticate from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

import { updateUserSchema } from "../validators/userValidator.js";

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

// All routes below require admin authentication
router.use(authenticate, authorizeRoles("admin"));

// GET all users
router.get("/", getUsers);

// GET user by ID
router.get("/:id", getUser);

// UPDATE user
router.patch("/:id", validate(updateUserSchema), editUser);

// DELETE user
router.delete("/:id", removeUser);

export default router;