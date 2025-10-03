const ExpenseCategory = require('../models/ExpenseCategory')
const Expense = require('../models/Expense')

// AI-powered expense categorization service
class ExpenseCategorizer {
  constructor() {
    // Pre-trained patterns for expense categorization
    this.categoryPatterns = {
      'Food': {
        keywords: ['restaurant', 'cafe', 'zomato', 'swiggy', 'uber eats', 'dominos', 'pizza', 'burger', 'mcdonald', 'kfc', 'subway', 'starbucks', 'food', 'dining', 'grocery', 'supermarket', 'walmart', 'target', 'whole foods', 'trader joes'],
        vendors: ['zomato', 'swiggy', 'uber eats', 'grubhub', 'doordash', 'postmates'],
        confidence: 0.9
      },
      'Transportation': {
        keywords: ['uber', 'lyft', 'taxi', 'cab', 'bus', 'train', 'metro', 'gas', 'petrol', 'fuel', 'parking', 'toll', 'uber', 'ola', 'auto', 'rickshaw'],
        vendors: ['uber', 'lyft', 'ola', 'shell', 'bp', 'exxon'],
        confidence: 0.85
      },
      'Shopping': {
        keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'shopping', 'mall', 'store', 'clothes', 'shoes', 'electronics', 'gadgets', 'books'],
        vendors: ['amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'walmart', 'target'],
        confidence: 0.8
      },
      'Entertainment': {
        keywords: ['movie', 'cinema', 'netflix', 'spotify', 'gaming', 'game', 'concert', 'show', 'theatre', 'bookmyshow', 'paytm movies'],
        vendors: ['netflix', 'spotify', 'amazon prime', 'disney+', 'bookmyshow'],
        confidence: 0.85
      },
      'Healthcare': {
        keywords: ['hospital', 'doctor', 'medicine', 'pharmacy', 'medical', 'health', 'clinic', 'dentist', 'appointment', 'prescription'],
        vendors: ['apollo', 'fortis', 'max healthcare', 'medplus', 'pharmaeasy'],
        confidence: 0.9
      },
      'Utilities': {
        keywords: ['electricity', 'water', 'gas', 'internet', 'phone', 'mobile', 'broadband', 'wifi', 'bill', 'utility'],
        vendors: ['bsnl', 'airtel', 'jio', 'vi', 'tata sky', 'dish tv'],
        confidence: 0.95
      },
      'Education': {
        keywords: ['school', 'college', 'university', 'course', 'book', 'education', 'learning', 'training', 'certification'],
        vendors: ['coursera', 'udemy', 'pluralsight', 'linkedin learning'],
        confidence: 0.85
      },
      'Travel': {
        keywords: ['flight', 'hotel', 'booking', 'travel', 'vacation', 'trip', 'airline', 'airport', 'accommodation'],
        vendors: ['makemytrip', 'goibibo', 'yatra', 'cleartrip', 'booking.com', 'airbnb'],
        confidence: 0.9
      }
    }
    
    // Learning weights for user-specific patterns
    this.userPatterns = new Map()
  }

  // Categorize expense using AI patterns
  async categorizeExpense(expenseData, userId) {
    const { vendor, note, amount } = expenseData
    const text = `${vendor || ''} ${note || ''}`.toLowerCase()
    
    // Get user's historical patterns
    const userPattern = await this.getUserPatterns(userId)
    
    let bestMatch = null
    let highestScore = 0
    
    // Check against pre-trained patterns
    for (const [category, pattern] of Object.entries(this.categoryPatterns)) {
      let score = 0
      
      // Check keywords
      const keywordMatches = pattern.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      ).length
      score += (keywordMatches / pattern.keywords.length) * 0.7
      
      // Check vendor matches
      if (pattern.vendors) {
        const vendorMatches = pattern.vendors.filter(v => 
          text.includes(v.toLowerCase())
        ).length
        score += (vendorMatches / pattern.vendors.length) * 0.3
      }
      
      // Apply confidence multiplier
      score *= pattern.confidence
      
      if (score > highestScore) {
        highestScore = score
        bestMatch = {
          category,
          confidence: score,
          source: 'ai_pattern'
        }
      }
    }
    
    // Check user-specific patterns
    if (userPattern) {
      for (const [category, userScore] of userPattern.entries()) {
        if (userScore > highestScore) {
          highestScore = userScore
          bestMatch = {
            category,
            confidence: userScore,
            source: 'user_pattern'
          }
        }
      }
    }
    
    // Fallback to default category if confidence is too low
    if (!bestMatch || bestMatch.confidence < 0.3) {
      bestMatch = {
        category: this.inferCategoryFromAmount(amount),
        confidence: 0.2,
        source: 'amount_inference'
      }
    }
    
    return bestMatch
  }

  // Learn from user's manual categorizations
  async learnFromUser(userId, vendor, note, category) {
    const text = `${vendor || ''} ${note || ''}`.toLowerCase()
    
    if (!this.userPatterns.has(userId)) {
      this.userPatterns.set(userId, new Map())
    }
    
    const userPattern = this.userPatterns.get(userId)
    
    // Extract keywords and associate with category
    const words = text.split(/\s+/).filter(word => word.length > 2)
    
    for (const word of words) {
      if (!userPattern.has(word)) {
        userPattern.set(word, new Map())
      }
      
      const wordCategories = userPattern.get(word)
      const currentScore = wordCategories.get(category) || 0
      wordCategories.set(category, currentScore + 0.1)
    }
    
    // Save to database for persistence
    await this.saveUserPattern(userId, userPattern)
  }

  // Get smart suggestions for expense entry
  async getSmartSuggestions(partialText, userId) {
    const text = partialText.toLowerCase()
    const suggestions = []
    
    // Check against known patterns
    for (const [category, pattern] of Object.entries(this.categoryPatterns)) {
      for (const keyword of pattern.keywords) {
        if (keyword.includes(text) || text.includes(keyword)) {
          suggestions.push({
            type: 'vendor',
            value: keyword,
            category: category,
            confidence: pattern.confidence
          })
        }
      }
      
      if (pattern.vendors) {
        for (const vendor of pattern.vendors) {
          if (vendor.includes(text) || text.includes(vendor)) {
            suggestions.push({
              type: 'vendor',
              value: vendor,
              category: category,
              confidence: pattern.confidence
            })
          }
        }
      }
    }
    
    // Get user's recent expenses for personalized suggestions
    const recentExpenses = await Expense.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('vendor note category')
    
    for (const expense of recentExpenses) {
      const expenseText = `${expense.vendor || ''} ${expense.note || ''}`.toLowerCase()
      if (expenseText.includes(text) && text.length > 2) {
        suggestions.push({
          type: 'recent',
          value: expense.vendor || expense.note,
          category: expense.category,
          confidence: 0.8
        })
      }
    }
    
    // Remove duplicates and sort by confidence
    const uniqueSuggestions = suggestions
      .filter((item, index, self) => 
        index === self.findIndex(s => s.value === item.value)
      )
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5)
    
    return uniqueSuggestions
  }

  // Analyze spending patterns
  async analyzeSpendingPatterns(userId, timeRange = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeRange)
    
    const expenses = await Expense.find({
      userId,
      createdAt: { $gte: startDate }
    })
    
    const patterns = {
      categoryDistribution: {},
      vendorFrequency: {},
      timeOfDaySpending: Array(24).fill(0),
      dayOfWeekSpending: Array(7).fill(0),
      averageAmountByCategory: {},
      spendingTrends: [],
      unusualTransactions: []
    }
    
    // Analyze category distribution
    const categoryTotals = {}
    const categoryCount = {}
    
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized'
      const hour = new Date(expense.createdAt).getHours()
      const dayOfWeek = new Date(expense.createdAt).getDay()
      
      // Category analysis
      categoryTotals[category] = (categoryTotals[category] || 0) + expense.amount
      categoryCount[category] = (categoryCount[category] || 0) + 1
      
      // Time analysis
      patterns.timeOfDaySpending[hour] += expense.amount
      patterns.dayOfWeekSpending[dayOfWeek] += expense.amount
      
      // Vendor frequency
      if (expense.vendor) {
        patterns.vendorFrequency[expense.vendor] = 
          (patterns.vendorFrequency[expense.vendor] || 0) + 1
      }
    })
    
    // Calculate percentages and averages
    const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0)
    
    for (const [category, total] of Object.entries(categoryTotals)) {
      patterns.categoryDistribution[category] = {
        amount: total,
        percentage: ((total / totalSpent) * 100).toFixed(1),
        count: categoryCount[category]
      }
      
      patterns.averageAmountByCategory[category] = 
        (total / categoryCount[category]).toFixed(2)
    }
    
    // Find unusual transactions (outliers)
    for (const [category, data] of Object.entries(patterns.categoryDistribution)) {
      const avgAmount = parseFloat(patterns.averageAmountByCategory[category])
      const categoryExpenses = expenses.filter(e => e.category === category)
      
      categoryExpenses.forEach(expense => {
        if (expense.amount > avgAmount * 3) {
          patterns.unusualTransactions.push({
            ...expense.toObject(),
            reason: 'Amount significantly higher than average',
            avgAmount
          })
        }
      })
    }
    
    return patterns
  }

  // Generate spending insights and recommendations
  async generateInsights(userId) {
    const patterns = await this.analyzeSpendingPatterns(userId)
    const insights = []
    
    // Top spending categories
    const topCategories = Object.entries(patterns.categoryDistribution)
      .sort(([,a], [,b]) => b.amount - a.amount)
      .slice(0, 3)
    
    insights.push({
      type: 'top_spending',
      title: 'Top Spending Categories',
      data: topCategories,
      message: `Your top 3 spending categories are ${topCategories.map(([cat]) => cat).join(', ')}`
    })
    
    // Spending pattern analysis
    const peakHour = patterns.timeOfDaySpending.indexOf(Math.max(...patterns.timeOfDaySpending))
    const peakDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      patterns.dayOfWeekSpending.indexOf(Math.max(...patterns.dayOfWeekSpending))
    ]
    
    insights.push({
      type: 'spending_timing',
      title: 'Spending Patterns',
      message: `You tend to spend most at ${peakHour}:00 on ${peakDay}s`,
      recommendation: 'Consider setting up spending alerts during these peak times'
    })
    
    // Budget recommendations
    const totalMonthlySpending = Object.values(patterns.categoryDistribution)
      .reduce((sum, cat) => sum + cat.amount, 0)
    
    if (totalMonthlySpending > 0) {
      const recommendedBudget = totalMonthlySpending * 1.1 // 10% buffer
      insights.push({
        type: 'budget_recommendation',
        title: 'Budget Suggestion',
        message: `Based on your spending, consider a monthly budget of ₹${recommendedBudget.toFixed(0)}`,
        amount: recommendedBudget
      })
    }
    
    return insights
  }

  // Helper methods
  async getUserPatterns(userId) {
    if (this.userPatterns.has(userId)) {
      return this.userPatterns.get(userId)
    }
    
    // Load from database
    try {
      const userCategory = await ExpenseCategory.findOne({ userId })
      if (userCategory && userCategory.patterns) {
        const patterns = new Map(Object.entries(userCategory.patterns))
        this.userPatterns.set(userId, patterns)
        return patterns
      }
    } catch (error) {
      console.error('Error loading user patterns:', error)
    }
    
    return null
  }

  async saveUserPattern(userId, patterns) {
    try {
      const patternObject = Object.fromEntries(patterns)
      await ExpenseCategory.findOneAndUpdate(
        { userId },
        { patterns: patternObject },
        { upsert: true }
      )
    } catch (error) {
      console.error('Error saving user patterns:', error)
    }
  }

  inferCategoryFromAmount(amount) {
    if (amount < 100) return 'Food'
    if (amount < 500) return 'Transportation'
    if (amount < 2000) return 'Shopping'
    if (amount < 5000) return 'Entertainment'
    return 'Other'
  }
}

module.exports = new ExpenseCategorizer()