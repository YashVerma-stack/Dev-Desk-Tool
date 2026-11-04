import {
  assignMembersToProject,
  getProjectMembers,
  removeMemberFromProject,
} from "../models/projectMemberModel.js";
import {
  createProjectWithMembers,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../models/projectModel.js";

import { createNotification } from "../models/notificationModel.js";



const getProjectAccess = (req) => ({
  userId: req.user.id,
  isAdmin: req.user.role === "admin",
});

const notifyProjectMembers = async (members, project) => {
  const results = await Promise.allSettled(
    members.map((member) =>
      createNotification({
        userId: member.user_id ?? member.id,
        title: "New Project Assigned",
        message: `You have been added to the project "${project.name}".`,
        type: "project_assigned",
      })
    )
  );

  results.forEach((result) => {
    if (result.status === "rejected") {
      console.error(
        "Project notification creation failed:",
        result.reason.message
      );
    }
  });
};

// 1. Create Project

export const createProjectController = async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one project member is required",
      });
    }

    for (const memberId of memberIds) {
      if (!Number.isSafeInteger(memberId) || memberId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid member ID",
        });
      }
    }

    const result = await createProjectWithMembers(
      name,
      description,
      req.user.id,
      memberIds
    );

    if (result.status === "invalid_member") {
      return res.status(400).json({
        success: false,
        message: `User ${result.memberId} is not an active member`,
      });
    }

    if (result.status !== "created") {
      throw new Error("Unexpected project creation result");
    }

    // Notify all assigned members after successful project creation
    await notifyProjectMembers(
      memberIds.map((id) => ({ user_id: id })),
      result.project
    );

    return res.status(201).json({
      success: true,
      message: "Project created and members assigned successfully",
      project: result.project,
    });
  } catch (error) {
    console.error("Create project error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};




// 2. Get All Projects
export const getAllProjectsController = async (req, res) => {
  try {
    const { userId, isAdmin } = getProjectAccess(req);

    const projects = await getAllProjects(userId, isAdmin);

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};


// 3. Get Single Project
export const getProjectController = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const { userId, isAdmin } = getProjectAccess(req);

    const project = await getProjectById(
      projectId,
      userId,
      isAdmin
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get project error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project",
    });
  }
};

// 6. Get Project Members
export const getProjectMembersController = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const { userId, isAdmin } = getProjectAccess(req);

    // Check whether the user can access this project
    const project = await getProjectById(
      projectId,
      userId,
      isAdmin
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
      });
    }

    const members = await getProjectMembers(projectId);

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get project members error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project members",
    });
  }
};

// 7. Remove Member From Project
export const removeProjectMemberController = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const userId = Number(req.params.userId);

    if (
      !Number.isSafeInteger(projectId) ||
      projectId <= 0 ||
      !Number.isSafeInteger(userId) ||
      userId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID or user ID",
      });
    }

    const result = await removeMemberFromProject(
      projectId,
      userId
    );

    if (result.status === "project_not_found") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (result.status === "assignment_not_found") {
      return res.status(404).json({
        success: false,
        message: "Member is not assigned to this project",
      });
    }

    if (result.status === "last_member") {
      return res.status(400).json({
        success: false,
        message: "Cannot remove the last active member from a project",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Member removed from project successfully",
      assignment: result.assignment,
    });
  } catch (error) {
    console.error("Remove project member error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to remove member from project",
    });
  }
};

// 8. Assign Members To Existing Project
export const assignProjectMembersController = async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const { memberIds } = req.body;

    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one project member is required",
      });
    }

    for (const memberId of memberIds) {
      if (!Number.isSafeInteger(memberId) || memberId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid member ID",
        });
      }
    }

    const result = await assignMembersToProject(
      projectId,
      memberIds
    );

    if (result.status === "project_not_found") {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    if (result.status === "invalid_member") {
      return res.status(400).json({
        success: false,
        message: `User ${result.memberId} is not an active member`,
      });
    }

    if (result.status !== "assigned") {
      throw new Error("Unexpected member assignment result");
    }

    // Get project details for the notification message
    if (result.assignedMembers.length > 0) {
      const project = await getProjectById(
        projectId,
        req.user.id,
        true
      );

      // Notify only newly assigned members
      if (project) {
        await notifyProjectMembers(
          result.assignedMembers,
          project
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Project members assigned successfully",
      assignedCount: result.assignedMembers.length,
      assignedMembers: result.assignedMembers,
    });
  } catch (error) {
    console.error("Assign project members error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to assign project members",
    });
  }
};


// 4. Update Project
export const updateProjectController = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const { name, description } = req.body;

    const project = await updateProject(
      projectId,
      name,
      description
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};


// 5. Delete Project
export const deleteProjectController = async (req, res) => {
  try {
    const projectId = Number(req.params.id);

    if (!Number.isSafeInteger(projectId) || projectId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await deleteProject(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};