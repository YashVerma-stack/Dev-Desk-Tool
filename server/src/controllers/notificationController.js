
import {
  getUserNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../models/notificationModel.js";

// ==========================================
// 1. GET USER NOTIFICATIONS
// ==========================================

export const getNotificationsController = async (req, res) => {
  try {
    const userId = req.user.id;

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 20, 1),
      50
    );

    const offset = Math.max(
      Number(req.query.offset) || 0,
      0
    );

    const notifications = await getUserNotifications(
      userId,
      limit,
      offset
    );

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Get notifications error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

// ==========================================
// 2. GET UNREAD NOTIFICATION COUNT
// ==========================================

export const getUnreadCountController = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await getUnreadCount(userId);

    return res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error("Get unread count error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count",
    });
  }
};

// ==========================================
// 3. MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsReadController = async (req, res) => {
  try {
    const notificationId = Number(req.params.id);

    if (
      !Number.isSafeInteger(notificationId) ||
      notificationId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID",
      });
    }

    const notification = await markNotificationAsRead(
      notificationId,
      req.user.id
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

// ==========================================
// 4. MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsReadController = async (
  req,
  res
) => {
  try {
    const updatedCount = await markAllNotificationsAsRead(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      updatedCount,
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};
