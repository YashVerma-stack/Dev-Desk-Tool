
import express from "express";

import {
  getNotificationsController,
  getUnreadCountController,
  markNotificationAsReadController,
  markAllNotificationsAsReadController,
} from "../controllers/notificationController.js";

const router = express.Router();

// Get notifications
router.get("/", getNotificationsController);

// Get unread notification count
router.get("/unread-count", getUnreadCountController);

// Mark all notifications as read
router.patch("/read-all", markAllNotificationsAsReadController);

// Mark one notification as read
router.patch("/:id/read", markNotificationAsReadController);

export default router;
