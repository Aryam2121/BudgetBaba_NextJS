const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const User = require("../server/models/User")
const Expense = require("../server/models/Expense")
require("dotenv").config()

const sampleUsers = [
  {
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    monthlyBudget: 50000,
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    monthlyBudget: 30000,
  },
]

const sampleExpenses = [
  // Food expenses
  { amount: 250, category: "Food", vendor: "Zomato", note: "Lunch order", daysAgo: 1 },
  { amount: 180, category: "Food", vendor: "Swiggy", note: "Dinner", daysAgo: 2 },
  { amount: 1200, category: "Food", vendor: "Big Bazaar", note: "Grocery shopping", daysAgo: 3 },

  // Transport expenses
  { amount: 150, category: "Transport", vendor: "Uber", note: "Ride to office", daysAgo: 1 },
  { amount: 80, category: "Transport", vendor: "Metro", note: "Daily commute", daysAgo: 2 },
  { amount: 2000, category: "Transport", vendor: "Petrol Pump", note: "Fuel", daysAgo: 4 },

  // Shopping expenses
  { amount: 1500, category: "Shopping", vendor: "Amazon", note: "Mobile accessories", daysAgo: 5 },
  { amount: 800, category: "Shopping", vendor: "Myntra", note: "Clothes", daysAgo: 7 },

  // Entertainment
  { amount: 199, category: "Entertainment", vendor: "Netflix", note: "Monthly subscription", daysAgo: 10 },
  { amount: 300, category: "Entertainment", vendor: "PVR Cinemas", note: "Movie tickets", daysAgo: 8 },

  // Bills
  { amount: 1200, category: "Bills", vendor: "BESCOM", note: "Electricity bill", daysAgo: 15 },
  { amount: 599, category: "Bills", vendor: "Airtel", note: "Mobile recharge", daysAgo: 12 },

  // Healthcare
  { amount: 500, category: "Healthcare", vendor: "Apollo Pharmacy", note: "Medicines", daysAgo: 6 },

  // Education
  { amount: 2000, category: "Education", vendor: "Udemy", note: "Online course", daysAgo: 20 },
]

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    await Expense.deleteMany({})
    console.log("Cleared existing data")

    // Create users
    const createdUsers = []
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      const user = new User({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        monthlyBudget: userData.monthlyBudget,
      })
      await user.save()
      createdUsers.push(user)
      console.log(`Created user: ${user.email}`)
    }

    // Create expenses for each user
    for (const user of createdUsers) {
      for (const expenseData of sampleExpenses) {
        const expenseDate = new Date()
        expenseDate.setDate(expenseDate.getDate() - expenseData.daysAgo)

        const expense = new Expense({
          userId: user._id,
          amount: expenseData.amount,
          category: expenseData.category,
          vendor: expenseData.vendor,
          note: expenseData.note,
          date: expenseDate,
        })
        await expense.save()
      }
      console.log(`Created ${sampleExpenses.length} expenses for ${user.email}`)
    }

    console.log("Database seeded successfully!")
    console.log("\nSample login credentials:")
    console.log("Email: john@example.com, Password: password123")
    console.log("Email: jane@example.com, Password: password123")
  } catch (error) {
    console.error("Seeding failed:", error)
  } finally {
    await mongoose.disconnect()
  }
}

seedDatabase()
