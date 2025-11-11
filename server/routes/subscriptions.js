const express = require('express')
const router = express.Router()
const subscriptionsController = require('../controllers/subscriptionsController')
const authMiddleware = require('../middleware/auth')

// Apply authentication to all routes
router.use(authMiddleware)

// Routes
router.get('/', subscriptionsController.getSubscriptions)
router.get('/upcoming', subscriptionsController.getUpcomingRenewals)
router.get('/analytics', subscriptionsController.getAnalytics)
router.get('/:id', subscriptionsController.getSubscription)
router.post('/', subscriptionsController.createSubscription)
router.put('/:id', subscriptionsController.updateSubscription)
router.delete('/:id', subscriptionsController.deleteSubscription)
router.post('/:id/payment', subscriptionsController.processPayment)

module.exports = router
