const Notification = require("../models/Notification")
const User = require("../models/User")

// Get user notifications with pagination
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id
    const { page = 1, limit = 20, unreadOnly = false, type } = req.query

    const filter = { userId }
    
    if (unreadOnly === 'true') {
      filter.isRead = false
    }
    
    if (type) {
      filter.type = type
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Notification.countDocuments(filter)
    const unreadCount = await Notification.countDocuments({ userId, isRead: false })

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      },
      unreadCount
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    res.status(500).json({ error: "Failed to get notifications" })
  }
}

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    )

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" })
    }

    // Emit real-time update
    const io = req.app.get('socketio')
    io.to(`user-${userId}`).emit('notification-read', { notificationId: id })

    res.json({ message: "Notification marked as read", notification })
  } catch (error) {
    console.error("Mark as read error:", error)
    res.status(500).json({ error: "Failed to mark notification as read" })
  }
}

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id

    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    )

    // Emit real-time update
    const io = req.app.get('socketio')
    io.to(`user-${userId}`).emit('all-notifications-read')

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error("Mark all as read error:", error)
    res.status(500).json({ error: "Failed to mark all notifications as read" })
  }
}

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const notification = await Notification.findOneAndDelete({ _id: id, userId })

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" })
    }

    // Emit real-time update
    const io = req.app.get('socketio')
    io.to(`user-${userId}`).emit('notification-deleted', { notificationId: id })

    res.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Delete notification error:", error)
    res.status(500).json({ error: "Failed to delete notification" })
  }
}

// Get notification settings
const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await User.findById(userId)

    const defaultSettings = {
      budgetAlerts: true,
      splitNotifications: true,
      monthlyReports: true,
      unusualSpending: true,
      emailNotifications: true,
      pushNotifications: true,
      weeklyDigest: false,
      goalReminders: true
    }

    const settings = user.notificationSettings || defaultSettings

    res.json({ settings })
  } catch (error) {
    console.error("Get notification settings error:", error)
    res.status(500).json({ error: "Failed to get notification settings" })
  }
}

// Update notification settings
const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user._id
    const settings = req.body

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationSettings: settings },
      { new: true }
    )

    res.json({ 
      message: "Notification settings updated",
      settings: user.notificationSettings 
    })
  } catch (error) {
    console.error("Update notification settings error:", error)
    res.status(500).json({ error: "Failed to update notification settings" })
  }
}

// Helper function to create notification
const createNotification = async (userId, type, title, message, data = {}, options = {}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data,
      priority: options.priority || 'medium',
      actionUrl: options.actionUrl,
      expiresAt: options.expiresAt
    })

    await notification.save()

    // Emit real-time notification
    const io = global.io || require("../server").io
    if (io) {
      io.to(`user-${userId}`).emit('new-notification', notification)
    }

    return notification
  } catch (error) {
    console.error("Create notification error:", error)
    throw error
  }
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  createNotification
}