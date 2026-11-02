
import express from "express";

import authorizeRoles from "../middleware/authorizeRoles.js";

import {
  createProjectController,
  getAllProjectsController,
  getProjectController,
  updateProjectController,
  deleteProjectController,
  getProjectMembersController,
  removeProjectMemberController,
  assignProjectMembersController,
} from "../controllers/projectController.js";

import {
  createProjectSchema,
  updateProjectSchema,
  assignProjectMembersSchema,
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

// ===================================
// PROJECT ROUTES
// ===================================

// Create project - Admin only
router.post(
  "/",
  authorizeRoles("admin"),
  validate(createProjectSchema),
  createProjectController
);

// Get accessible projects - Admin and Member
router.get("/", getAllProjectsController);

// Get single accessible project - Admin and Member
router.get("/:id", getProjectController);

// Get project team members - Admin and assigned Members
router.get("/:id/members", getProjectMembersController);

// Assign additional members - Admin only
router.post(
  "/:id/members",
  authorizeRoles("admin"),
  validate(assignProjectMembersSchema),
  assignProjectMembersController
);

// Remove member from project - Admin only
router.delete(
  "/:id/members/:userId",
  authorizeRoles("admin"),
  removeProjectMemberController
);

// Update project - Admin only
router.patch(
  "/:id",
  authorizeRoles("admin"),
  validate(updateProjectSchema),
  updateProjectController
);

// Delete project - Admin only
router.delete(
  "/:id",
  authorizeRoles("admin"),
  deleteProjectController
);

export default router;
