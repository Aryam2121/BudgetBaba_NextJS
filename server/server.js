const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const http = require("http")
const socketIo = require("socket.io")
const SchedulerService = require("./services/SchedulerService")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

const authRoutes = require("./routes/auth")
const expenseRoutes = require("./routes/expenses")
const splitRoutes = require("./routes/splits")
const emailRoutes = require("./routes/email")
const analyticsRoutes = require("./routes/analytics")
const notificationRoutes = require("./routes/notifications")
const goalRoutes = require("./routes/goals")
const recurringRoutes = require("./routes/recurring")
const budgetRoutes = require("./routes/budgets")
const exportRoutes = require("./routes/exports")
const categoriesRoutes = require("./routes/categories")
const subscriptionsRoutes = require("./routes/subscriptions")

const app = express()
const server = http.createServer(app)

// Dynamic CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [
      process.env.FRONTEND_URL || 'https://budgetbaba.vercel.app',
      'https://budgetbaba.vercel.app',
      'https://budgetbaba-nextjs.onrender.com'
    ]
  : [
      'http://localhost:3000', 
      'http://127.0.0.1:3000', 
      'https://budgetbaba.vercel.app'
    ]

const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
})

const PORT = process.env.PORT || 5000

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not defined in environment variables")
  process.exit(1)
}

if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn("GOOGLE_CLIENT_ID is not defined - Google OAuth will not work")
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("GOOGLE_CLIENT_SECRET is not defined - Google OAuth will not work")
}

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not defined in environment variables")
  process.exit(1)
}

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true)
    } else {
      console.warn(`CORS blocked origin: ${origin}`)
      console.warn(`Allowed origins: ${allowedOrigins.join(', ')}`)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 hours
}))

// Body parser middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/splits", splitRoutes)
app.use("/api/email", emailRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/goals", goalRoutes)
app.use("/api/recurring", recurringRoutes)
app.use("/api/budgets", budgetRoutes)
app.use("/api/exports", exportRoutes)
app.use("/api/categories", categoriesRoutes)
app.use("/api/subscriptions", subscriptionsRoutes)

// Make io available to routes
app.set('socketio', io)

// Initialize scheduler service
const scheduler = new SchedulerService(io)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join user to their personal room for notifications and updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined room: user-${userId}`)
  })

  // Join split-specific room
  socket.on('join-split-room', (splitId) => {
    socket.join(`split-${splitId}`)
    console.log(`Socket ${socket.id} joined split room: split-${splitId}`)
  })

  // Join goal-specific room
  socket.on('join-goal-room', (goalId) => {
    socket.join(`goal-${goalId}`)
    console.log(`Socket ${socket.id} joined goal room: goal-${goalId}`)
  })

  // Join budget-specific room
  socket.on('join-budget-room', (budgetId) => {
    socket.join(`budget-${budgetId}`)
    console.log(`Socket ${socket.id} joined budget room: budget-${budgetId}`)
  })

  // Handle notification acknowledgment
  socket.on('notification-read', (data) => {
    // Broadcast to user's room that notification was read
    socket.to(`user-${data.userId}`).emit('notification-updated', {
      notificationId: data.notificationId,
      isRead: true
    })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
})

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  })
})

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB Atlas successfully")
    // Listen on 0.0.0.0 for Render/Docker compatibility
    const HOST = process.env.HOST || '0.0.0.0'
    server.listen(PORT, HOST, () => {
      console.log(`Server running on ${HOST}:${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
      console.log(`Socket.IO enabled for real-time updates`)
      console.log(`Allowed origins: ${allowedOrigins.join(', ')}`)
      
      // Start scheduler service
      scheduler.start()
      console.log(`Scheduler service started successfully`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  })

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  scheduler.stop()
  server.close(() => {
    mongoose.connection.close()
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  scheduler.stop()
  server.close(() => {
    mongoose.connection.close()
    process.exit(0)
  })
})

module.exports = { app, server, io }