import api from "./api";

// Fetch all notifications
export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

// Fetch unread notification count
export const getUnreadCount = async () => {
  const response = await api.get("/notifications/unread-count");
  return response.data;
};

// Mark a single notification as read
export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.patch("/notifications/read-all");
  return response.data;
};