const Category = require('../models/Category')

const defaultCategories = [
  // Expense Categories
  { name: 'Food & Dining', icon: 'UtensilsCrossed', color: '#10B981', type: 'expense', order: 1 },
  { name: 'Transportation', icon: 'Car', color: '#3B82F6', type: 'expense', order: 2 },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#F59E0B', type: 'expense', order: 3 },
  { name: 'Entertainment', icon: 'Film', color: '#8B5CF6', type: 'expense', order: 4 },
  { name: 'Bills & Utilities', icon: 'Receipt', color: '#EF4444', type: 'expense', order: 5 },
  { name: 'Healthcare', icon: 'Heart', color: '#EC4899', type: 'expense', order: 6 },
  { name: 'Education', icon: 'GraduationCap', color: '#6366F1', type: 'expense', order: 7 },
  { name: 'Subscriptions', icon: 'Repeat', color: '#8B5CF6', type: 'expense', order: 8 },
  { name: 'Rent', icon: 'Home', color: '#14B8A6', type: 'expense', order: 9 },
  { name: 'Other', icon: 'MoreHorizontal', color: '#6B7280', type: 'expense', order: 10 },
  
  // Income Categories
  { name: 'Salary', icon: 'Briefcase', color: '#10B981', type: 'income', order: 1 },
  { name: 'Freelance', icon: 'Laptop', color: '#3B82F6', type: 'income', order: 2 },
  { name: 'Business', icon: 'Building2', color: '#F59E0B', type: 'income', order: 3 },
  { name: 'Investments', icon: 'TrendingUp', color: '#8B5CF6', type: 'income', order: 4 },
  { name: 'Other Income', icon: 'DollarSign', color: '#6B7280', type: 'income', order: 5 }
]

async function seedDefaultCategories(userId) {
  try {
    // Check if user already has categories
    const existingCount = await Category.countDocuments({ userId })
    if (existingCount > 0) {
      return { success: true, message: 'User already has categories' }
    }

    // Create default categories for the user
    const categories = defaultCategories.map(cat => ({
      ...cat,
      userId,
      isDefault: true
    }))

    await Category.insertMany(categories)
    
    return { 
      success: true, 
      message: 'Default categories created successfully',
      count: categories.length
    }
  } catch (error) {
    console.error('Error seeding default categories:', error)
    return { success: false, error: error.message }
  }
}

module.exports = {
  defaultCategories,
  seedDefaultCategories
}
