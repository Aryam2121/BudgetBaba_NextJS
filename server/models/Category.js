const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  icon: {
    type: String,
    default: 'Tag',
    trim: true
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color']
  },
  type: {
    type: String,
    enum: ['expense', 'income', 'both'],
    default: 'expense'
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
}, {
  timestamps: true
})

// Indexes
categorySchema.index({ userId: 1, name: 1 }, { unique: true })
categorySchema.index({ userId: 1, isActive: 1, order: 1 })

// Validate unique category name per user
categorySchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    const existing = await this.constructor.findOne({
      userId: this.userId,
      name: { $regex: new RegExp(`^${this.name}$`, 'i') },
      _id: { $ne: this._id }
    })
    if (existing) {
      throw new Error('Category name already exists')
    }
  }
  next()
})

module.exports = mongoose.model('Category', categorySchema)
