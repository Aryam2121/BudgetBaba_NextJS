const mongoose = require("mongoose")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") })

const User = require("../models/User")
const Expense = require("../models/Expense")

// Usage:
//   node scripts/seed-bulk-data.js                     → 2000 rows for first user in DB
//   node scripts/seed-bulk-data.js 2000                → same, custom count
//   node scripts/seed-bulk-data.js 2000 --userId=abc   → rows for that user only
//   node scripts/seed-bulk-data.js 2000 --email=user@mail.com → rows for that email
//   node scripts/seed-bulk-data.js 2000 --all-users    → split rows across all users

function parseArgs(argv) {
  const args = argv.slice(2)
  let count = 2000
  let userId = null
  let email = null
  let allUsers = false

  for (const arg of args) {
    if (arg === "--all-users") {
      allUsers = true
    } else if (arg.startsWith("--userId=")) {
      userId = arg.slice("--userId=".length).trim()
    } else if (arg.startsWith("--email=")) {
      email = arg.slice("--email=".length).trim().toLowerCase()
    } else if (!Number.isNaN(parseInt(arg, 10))) {
      count = parseInt(arg, 10)
    }
  }

  return { count, userId, email, allUsers }
}

const { count: TOTAL_RECORDS, userId: TARGET_USER_ID, email: TARGET_EMAIL, allUsers: ALL_USERS } = parseArgs(process.argv)

const CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Bills", "Healthcare", "Education", "Other"]

const VENDORS = {
  Food: ["Zomato", "Swiggy", "Big Bazaar", "DMart", "Starbucks", "McDonald's", "Local Cafe"],
  Transport: ["Uber", "Ola", "Metro", "Petrol Pump", "Rapido", "IRCTC"],
  Shopping: ["Amazon", "Flipkart", "Myntra", "Reliance Digital", "Croma", "Ajio"],
  Entertainment: ["Netflix", "Spotify", "PVR Cinemas", "BookMyShow", "Steam", "PlayStation"],
  Bills: ["BESCOM", "Airtel", "Jio", "ACT Fibernet", "Gas Agency", "Water Board"],
  Healthcare: ["Apollo Pharmacy", "Practo", "Fortis", "1mg", "Cult.fit"],
  Education: ["Udemy", "Coursera", "Unacademy", "BYJU'S", "Stationery Store"],
  Other: ["ATM Withdrawal", "Misc Purchase", "Gift Shop", "Donation", "Repair Shop"],
}

const NOTES = [
  "Monthly expense",
  "Weekend purchase",
  "Quick payment",
  "Planned spending",
  "Emergency purchase",
  "Shared with friends",
  "Work related",
  "Personal use",
]

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function randomAmount(category) {
  const ranges = {
    Food: [50, 2500],
    Transport: [30, 3000],
    Shopping: [200, 15000],
    Entertainment: [99, 2000],
    Bills: [300, 5000],
    Healthcare: [100, 4000],
    Education: [500, 10000],
    Other: [50, 5000],
  }
  const [min, max] = ranges[category]
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function randomDateWithinDays(daysBack) {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0)
  return date
}

function buildExpenseDocs(userId, count, startIndex = 0) {
  const docs = []

  for (let i = 0; i < count; i++) {
    const category = randomItem(CATEGORIES)
    docs.push({
      userId,
      amount: randomAmount(category),
      category,
      vendor: randomItem(VENDORS[category]),
      note: `${randomItem(NOTES)} #${startIndex + i + 1}`,
      date: randomDateWithinDays(365),
    })
  }

  return docs
}

async function resolveTargetUsers() {
  if (ALL_USERS) {
    const users = await User.find().select("_id email name")
    if (users.length === 0) {
      throw new Error("No users found. Register a user first or omit --all-users.")
    }
    console.log(`Spreading data across ${users.length} user(s)`)
    return users
  }

  if (TARGET_EMAIL) {
    const normalizedEmail = TARGET_EMAIL.includes("@")
      ? TARGET_EMAIL
      : TARGET_EMAIL.replace(/gmail\.com$/, "@gmail.com")

    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      throw new Error(`User not found for email: ${normalizedEmail}`)
    }

    console.log(`Using email: ${user.email} (${user._id})`)
    return [user]
  }

  if (TARGET_USER_ID) {
    if (!mongoose.Types.ObjectId.isValid(TARGET_USER_ID)) {
      throw new Error(`Invalid user id: ${TARGET_USER_ID}`)
    }

    const user = await User.findById(TARGET_USER_ID)
    if (!user) {
      throw new Error(`User not found for id: ${TARGET_USER_ID}`)
    }

    console.log(`Using specified user: ${user.email} (${user._id})`)
    return [user]
  }

  const user = await User.findOne().sort({ createdAt: 1 })
  if (user) {
    console.log(`Using first user in DB: ${user.email} (${user._id})`)
    return [user]
  }

  const seedUser = new User({
    name: "Seed User",
    email: `seed-${Date.now()}@budgetbaba.test`,
    passwordHash: "seedpassword123",
    monthlyBudget: 75000,
    currency: "INR",
  })

  await seedUser.save()
  console.log(`No users found. Created seed user: ${seedUser.email} (${seedUser._id})`)
  return [seedUser]
}

async function insertInBatches(docs) {
  const batchSize = 500
  let inserted = 0

  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize)
    await Expense.insertMany(batch, { ordered: false })
    inserted += batch.length
    console.log(`Inserted ${inserted}/${docs.length} expenses...`)
  }
}

async function seedBulkData() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env")
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  console.log("Connected to MongoDB")

  const users = await resolveTargetUsers()
  let allDocs = []

  if (ALL_USERS) {
    const perUser = Math.floor(TOTAL_RECORDS / users.length)
    const remainder = TOTAL_RECORDS % users.length
    let index = 0

    for (let i = 0; i < users.length; i++) {
      const count = perUser + (i < remainder ? 1 : 0)
      allDocs = allDocs.concat(buildExpenseDocs(users[i]._id, count, index))
      index += count
      console.log(`Prepared ${count} rows for ${users[i].email}`)
    }
  } else {
    allDocs = buildExpenseDocs(users[0]._id, TOTAL_RECORDS)
  }

  await insertInBatches(allDocs)

  for (const user of users) {
    const total = await Expense.countDocuments({ userId: user._id })
    console.log(`Total expenses for ${user.email}: ${total}`)
  }

  console.log(`Done. Added ${TOTAL_RECORDS} expense rows.`)
}

seedBulkData()
  .catch((error) => {
    console.error("Bulk seed failed:", error.message || error)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
