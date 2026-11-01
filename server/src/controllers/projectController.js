
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../models/projectModel.js";



const getProjectAccess = (req) => ({
  userId: req.user.id,
  isAdmin: req.user.role === "admin",
});

// 1. Create Project
export const createProjectController = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await createProject(
      name,
      description,
      req.user.id
    );

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
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
    const { userId, isAdmin } = getProjectAccess(req);

    const project = await updateProject(
      projectId,
      userId,
      isAdmin,
      name,
      description
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or access denied",
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

    const { userId, isAdmin } = getProjectAccess(req);

    const project = await deleteProject(
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
