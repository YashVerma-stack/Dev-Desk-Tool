
import api from "./api";

// Fetch all users
export const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

// Fetch a single user
export const getUserById = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// Update user details
export const updateUser = async (userId, userData) => {
  const response = await api.patch(`/users/${userId}`, userData);
  return response.data;
};

// Soft-delete user
export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Restore deleted user
export const restoreUser = async (userId) => {
  const response = await api.patch(`/users/${userId}/restore`);
  return response.data;
};


export const getUserWorkDetails = async (userId) => {
  const response = await api.get(`/users/${userId}/work-details`);
  return response.data;
};

// Fetch logged-in user's profile
export const getMyProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

// Update logged-in user's profile
export const updateMyProfile = async (profileData) => {
  const response = await api.patch("/users/profile", profileData);
  return response.data;
};

// Change logged-in user's password
export const changeMyPassword = async (passwordData) => {
  const response = await api.patch(
    "/users/change-password",
    passwordData
  );
  return response.data;
};