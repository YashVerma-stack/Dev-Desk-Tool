
import express from "express";

import authenticate from "../middleware/authMiddleware.js";

import {
  createProjectController,
  getAllProjectsController,
  getProjectController,
  updateProjectController,
  deleteProjectController,
} from "../controllers/projectController.js";

import {
  createProjectSchema,
  updateProjectSchema,
} from "../validators/projectValidator.js";

const router = express.Router();

// Reusable validation middleware
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

// Create project
router.post(
  "/",
  authenticate,
  validate(createProjectSchema),
  createProjectController
);

// Get all accessible projects
router.get(
  "/",
  authenticate,
  getAllProjectsController
);

// Get single project
router.get(
  "/:id",
  authenticate,
  getProjectController
);

// Update project
router.patch(
  "/:id",
  authenticate,
  validate(updateProjectSchema),
  updateProjectController
);

// Delete project
router.delete(
  "/:id",
  authenticate,
  deleteProjectController
);

export default router;
