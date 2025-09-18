const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const http = require("http")
const socketIo = require("socket.io")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

const authRoutes = require("./routes/auth")
const expenseRoutes = require("./routes/expenses")
const splitRoutes = require("./routes/splits")
const emailRoutes = require("./routes/email")

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.com' 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
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
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com' 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))

// Body parser middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/splits", splitRoutes)
app.use("/api/email", emailRoutes)

// Make io available to routes
app.set('socketio', io)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id)

  // Join user to their personal room for split updates
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined room: user-${userId}`)
  })

  // Join split-specific room
  socket.on('join-split-room', (splitId) => {
    socket.join(`split-${splitId}`)
    console.log(`Socket ${socket.id} joined split room: split-${splitId}`)
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
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Environment: ${process.env.NODE_ENV}`)
      console.log(`Socket.IO enabled for real-time split updates`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  })

module.exports = { app, server, io }