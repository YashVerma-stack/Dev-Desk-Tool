import pool from "../config/database.js";

// ==========================================
// 1. CREATE NOTIFICATION
// ==========================================

export const createNotification = async ({
  userId,
  title,
  message,
  type,
}) => {
  const query = `
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [userId, title, message, type];

  const result = await pool.query(query, values);

  return result.rows[0];
};

// ==========================================
// 2. GET USER NOTIFICATIONS
// ==========================================

export const getUserNotifications = async (
  userId,
  limit = 20,
  offset = 0
) => {
  const query = `
    SELECT *
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC, id DESC
    LIMIT $2 OFFSET $3;
  `;

  const result = await pool.query(query, [
    userId,
    limit,
    offset,
  ]);

  return result.rows;
};

// ==========================================
// 3. GET UNREAD NOTIFICATION COUNT
// ==========================================

export const getUnreadCount = async (userId) => {
  const query = `
    SELECT COUNT(*)::INTEGER AS unread_count
    FROM notifications
    WHERE user_id = $1
      AND is_read = FALSE;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows[0].unread_count;
};

// ==========================================
// 4. MARK ONE NOTIFICATION AS READ
// ==========================================

export const markNotificationAsRead = async (
  notificationId,
  userId
) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE id = $1
      AND user_id = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [
    notificationId,
    userId,
  ]);

  return result.rows[0] || null;
};

// ==========================================
// 5. MARK ALL NOTIFICATIONS AS READ
// ==========================================

export const markAllNotificationsAsRead = async (userId) => {
  const query = `
    UPDATE notifications
    SET is_read = TRUE
    WHERE user_id = $1
      AND is_read = FALSE
    RETURNING id;
  `;

  const result = await pool.query(query, [userId]);

  return result.rowCount;
};
