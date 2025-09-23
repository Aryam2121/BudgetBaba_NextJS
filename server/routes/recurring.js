const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  processRecurringTransactions,
  getRecurringAnalytics
} = require('../controllers/recurringController')

// Get all recurring transactions for user
router.get('/', auth, getRecurringTransactions)

// Create new recurring transaction
router.post('/', auth, createRecurringTransaction)

// Update recurring transaction
router.put('/:id', auth, updateRecurringTransaction)

// Delete recurring transaction
router.delete('/:id', auth, deleteRecurringTransaction)

// Process due recurring transactions
router.post('/process', auth, processRecurringTransactions)

// Get recurring transactions analytics
router.get('/analytics', auth, getRecurringAnalytics)

module.exports = router