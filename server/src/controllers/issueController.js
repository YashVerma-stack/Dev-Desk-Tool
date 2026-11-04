
import {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} from "../models/issueModel.js";

// ==========================================
// 1. CREATE ISSUE
// ==========================================

export const createIssueController = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      projectId,
      assignedTo,
    } = req.body;

    const result = await createIssue({
      title,
      description,
      priority,
      projectId,
      assignedTo,
      createdBy: req.user.id,
      userRole: req.user.role,
    });

    if (result.status === "project_not_found") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (result.status === "access_denied") {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this project",
      });
    }

    if (result.status === "invalid_assignee") {
      return res.status(400).json({
        success: false,
        message:
          "Assigned user must be an active member of this project",
      });
    }

    if (result.status !== "created") {
      throw new Error("Unexpected issue creation result");
    }

    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      issue: result.issue,
    });
  } catch (error) {
    console.error("Create issue error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create issue",
    });
  }
};

// ==========================================
// 2. GET ALL ISSUES
// ==========================================

export const getAllIssuesController = async (req, res) => {
  try {
    const issues = await getAllIssues(req.user);

    return res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error("Get all issues error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
    });
  }
};

// ==========================================
// 3. GET ISSUE BY ID
// ==========================================

export const getIssueByIdController = async (req, res) => {
  try {
    const issueId = Number(req.params.id);

    if (!Number.isSafeInteger(issueId) || issueId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const issue = await getIssueById(issueId, req.user);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    console.error("Get issue error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch issue",
    });
  }
};

// ==========================================
// 4. UPDATE ISSUE
// ==========================================

export const updateIssueController = async (req, res) => {
  try {
    const issueId = Number(req.params.id);

    if (!Number.isSafeInteger(issueId) || issueId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    // Only admins can change issue assignments
    if (
      req.user.role !== "admin" &&
      Object.prototype.hasOwnProperty.call(req.body, "assignedTo")
    ) {
      return res.status(403).json({
        success: false,
        message: "Only admins can change issue assignments.",
      });
    }

    const {
      title,
      description,
      status,
      priority,
      assignedTo,
    } = req.body;

    const result = await updateIssue(issueId, req.user, {
      title,
      description,
      status,
      priority,
      assignedTo,
    });

    if (result.status === "not_found") {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    if (result.status === "access_denied") {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this issue",
      });
    }

    if (result.status === "invalid_assignee") {
      return res.status(400).json({
        success: false,
        message:
          "Assigned user must be an active member of this project",
      });
    }

    if (result.status === "no_changes") {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update",
      });
    }

    if (result.status !== "updated") {
      throw new Error("Unexpected issue update result");
    }

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      issue: result.issue,
    });
  } catch (error) {
    console.error("Update issue error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update issue",
    });
  }
};

// ==========================================
// 5. DELETE ISSUE
// ==========================================

export const deleteIssueController = async (req, res) => {
  try {
    // Only admins can delete issues
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admins can delete issues.",
      });
    }

    const issueId = Number(req.params.id);

    if (!Number.isSafeInteger(issueId) || issueId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid issue ID",
      });
    }

    const deletedIssue = await deleteIssue(issueId);

    if (!deletedIssue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
      issue: deletedIssue,
    });
  } catch (error) {
    console.error("Delete issue error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete issue",
    });
  }
};
