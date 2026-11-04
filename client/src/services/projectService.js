
import api from "./api";

// Fetch all projects
export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
};

// Fetch a single project
export const getProjectById = async (projectId) => {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
};

// Create a project
export const createProject = async (projectData) => {
  const response = await api.post("/projects", projectData);
  return response.data;
};

// Update a project
export const updateProject = async (projectId, projectData) => {
  const response = await api.patch(
    `/projects/${projectId}`,
    projectData
  );
  return response.data;
};

// Delete a project
export const deleteProject = async (projectId) => {
  const response = await api.delete(`/projects/${projectId}`);
  return response.data;
};

// Fetch project members
export const getProjectMembers = async (projectId) => {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data;
};

// Add project members
export const addProjectMembers = async (projectId, memberIds) => {
  const response = await api.post(`/projects/${projectId}/members`, {
    memberIds,
  });
  return response.data;
};

// Remove a project member
export const removeProjectMember = async (projectId, userId) => {
  const response = await api.delete(
    `/projects/${projectId}/members/${userId}`
  );
  return response.data;
};
