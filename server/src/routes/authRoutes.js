
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { registerSchema, loginSchema } from "../validators/authValidator.js";

const router = express.Router();

router.post("/register", (req, res, next) => {
  const result = registerSchema.safeParse(req.body);

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

  // Use normalized and validated data
  req.body = result.data;

  next();
}, registerUser);


router.post("/login", (req, res, next) => {
  const result = loginSchema.safeParse(req.body);

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
}, loginUser);


export default router;
