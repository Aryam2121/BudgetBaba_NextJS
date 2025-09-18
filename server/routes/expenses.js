const express = require("express")
const multer = require("multer")
const authMiddleware = require("../middleware/auth")
const { getExpenses, addExpense, uploadExpenses, getMonthlySummary, getDashboardStats } = require("../controllers/expenseController")

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/csv" || file.originalname.endsWith(".csv")) {
      cb(null, true)
    } else {
      cb(new Error("Only CSV files are allowed"), false)
    }
  },
})

// All routes require authentication
router.use(authMiddleware)

// GET /api/expenses - Get user's expenses with optional filters
router.get("/", getExpenses)

// POST /api/expenses - Add new expense
router.post("/", addExpense)

// POST /api/expenses/upload - Upload CSV expenses
router.post("/upload", uploadExpenses)

// GET /api/summary/monthly - Get monthly summary and trends
router.get("/summary/monthly", getMonthlySummary)

// GET /api/dashboard/stats - Get dashboard statistics
router.get("/dashboard/stats", getDashboardStats)

module.exports = router
