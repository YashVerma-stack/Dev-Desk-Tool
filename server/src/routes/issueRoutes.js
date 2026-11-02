
import express from "express";

import {
  createIssueController,
  getAllIssuesController,
  getIssueByIdController,
  updateIssueController,
  deleteIssueController,
} from "../controllers/issueController.js";

import authorizeRoles from "../middleware/authorizeRoles.js";

import {
  createIssueSchema,
  updateIssueSchema,
} from "../validators/issueValidator.js";

const router = express.Router();

// ==========================================
// REQUEST VALIDATION MIDDLEWARE
// ==========================================

const validate = (schema) => (req, res, next) => {
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

// ==========================================
// ISSUE ROUTES
// ==========================================

// Create an issue
router.post(
  "/",
  validate(createIssueSchema),
  createIssueController
);

// Get all issues
router.get(
  "/",
  getAllIssuesController
);

// Get a single issue
router.get(
  "/:id",
  getIssueByIdController
);

// Update an issue
router.patch(
  "/:id",
  validate(updateIssueSchema),
  updateIssueController
);

// Delete an issue (admin only)
router.delete(
  "/:id",
  authorizeRoles("admin"),
  deleteIssueController
);

export default router;
