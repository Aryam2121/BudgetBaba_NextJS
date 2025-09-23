const express = require("express")
const authMiddleware = require("../middleware/auth")
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings
} = require("../controllers/notificationController")

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// GET /api/notifications - Get user notifications
router.get("/", getNotifications)

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", markAsRead)

// PUT /api/notifications/read-all - Mark all notifications as read
router.put("/read-all", markAllAsRead)

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", deleteNotification)

// GET /api/notifications/settings - Get notification preferences
router.get("/settings", getNotificationSettings)

// PUT /api/notifications/settings - Update notification preferences
router.put("/settings", updateNotificationSettings)

module.exports = router