
import api from "./api";

// Fetch all accessible issues
export const getIssues = async () => {
  const response = await api.get("/issues");
  return response.data;
};

// Fetch issue details
export const getIssueById = async (issueId) => {
  const response = await api.get(`/issues/${issueId}`);
  return response.data;
};

// Create issue
export const createIssue = async (issueData) => {
  const response = await api.post("/issues", issueData);
  return response.data;
};

// Update issue
export const updateIssue = async (issueId, issueData) => {
  const response = await api.patch(`/issues/${issueId}`, issueData);
  return response.data;
};

// Delete issue
export const deleteIssue = async (issueId) => {
  const response = await api.delete(`/issues/${issueId}`);
  return response.data;
};
