const mongoose = require("mongoose")

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"],
    min: [0.01, "Amount must be greater than 0"],
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    trim: true,
    enum: ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Other"],
    default: "Other",
  },
  vendor: {
    type: String,
    trim: true,
    maxlength: [100, "Vendor name cannot exceed 100 characters"],
  },
  note: {
    type: String,
    trim: true,
    maxlength: [500, "Note cannot exceed 500 characters"],
  },
  date: {
    type: Date,
    required: [true, "Date is required"],
    default: Date.now,
  },
  // Split-related fields
  isSplit: {
    type: Boolean,
    default: false,
  },
  splitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Split",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Index for efficient queries
expenseSchema.index({ userId: 1, date: -1 })
expenseSchema.index({ userId: 1, category: 1 })

module.exports = mongoose.model("Expense", expenseSchema)
