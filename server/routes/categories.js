const express = require('express')
const router = express.Router()
const categoriesController = require('../controllers/categoriesController')
const { protect } = require('../middleware/auth')

// Apply authentication to all routes
router.use(protect)

// Routes
router.get('/', categoriesController.getCategories)
router.post('/', categoriesController.createCategory)
router.put('/:id', categoriesController.updateCategory)
router.delete('/:id', categoriesController.deleteCategory)
router.post('/reorder', categoriesController.reorderCategories)
router.post('/seed', categoriesController.seedDefaultCategories)

module.exports = router
