const Category = require('../models/Category')
const { seedDefaultCategories } = require('../utils/defaultCategories')

// Get all categories for user
exports.getCategories = async (req, res) => {
  try {
    const { type, active } = req.query
    
    const filter = { userId: req.user.id }
    if (type) filter.type = { $in: [type, 'both'] }
    if (active !== undefined) filter.isActive = active === 'true'

    const categories = await Category.find(filter).sort({ order: 1, name: 1 })
    
    // If no categories exist, seed default ones
    if (categories.length === 0) {
      await seedDefaultCategories(req.user.id)
      const newCategories = await Category.find(filter).sort({ order: 1, name: 1 })
      return res.json({ success: true, categories: newCategories })
    }

    res.json({ success: true, categories })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, color, type, description } = req.body

    // Get highest order number
    const maxOrder = await Category.findOne({ userId: req.user.id })
      .sort({ order: -1 })
      .select('order')
    
    const category = new Category({
      userId: req.user.id,
      name,
      icon: icon || 'Tag',
      color: color || '#3B82F6',
      type: type || 'expense',
      description,
      order: (maxOrder?.order || 0) + 1,
      isDefault: false
    })

    await category.save()
    res.status(201).json({ success: true, category })
  } catch (error) {
    if (error.message === 'Category name already exists') {
      return res.status(400).json({ success: false, error: error.message })
    }
    res.status(500).json({ success: false, error: error.message })
  }
}

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params
    const { name, icon, color, type, description, isActive, order } = req.body

    const category = await Category.findOne({ _id: id, userId: req.user.id })
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }

    // Don't allow changing name of default categories
    if (category.isDefault && name && name !== category.name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot change name of default categories' 
      })
    }

    if (name) category.name = name
    if (icon) category.icon = icon
    if (color) category.color = color
    if (type) category.type = type
    if (description !== undefined) category.description = description
    if (isActive !== undefined) category.isActive = isActive
    if (order !== undefined) category.order = order

    await category.save()
    res.json({ success: true, category })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findOne({ _id: id, userId: req.user.id })
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' })
    }

    // Don't allow deleting default categories
    if (category.isDefault) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete default categories. You can deactivate them instead.' 
      })
    }

    await category.deleteOne()
    res.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Reorder categories
exports.reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body // Array of { id, order }

    if (!Array.isArray(categories)) {
      return res.status(400).json({ success: false, error: 'Categories must be an array' })
    }

    // Update each category's order
    const updates = categories.map(({ id, order }) =>
      Category.updateOne(
        { _id: id, userId: req.user.id },
        { $set: { order } }
      )
    )

    await Promise.all(updates)
    res.json({ success: true, message: 'Categories reordered successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}

// Seed default categories
exports.seedDefaultCategories = async (req, res) => {
  try {
    const result = await seedDefaultCategories(req.user.id)
    if (result.success) {
      res.json(result)
    } else {
      res.status(500).json(result)
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
