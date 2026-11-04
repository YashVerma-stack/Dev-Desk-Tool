import api from "./api";

// Get dashboard overview
export const getDashboardOverview = async () => {
  const response = await api.get("/dashboard/overview");
  return response.data;
};

// Get issue statistics
export const getDashboardIssueStats = async () => {
  const response = await api.get("/dashboard/issues");
  return response.data;
};

// Get project statistics
export const getDashboardProjectStats = async () => {
  const response = await api.get("/dashboard/projects");
  return response.data;
};
