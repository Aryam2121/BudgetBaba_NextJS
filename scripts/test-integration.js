const request = require("supertest")
const mongoose = require("mongoose")
const app = require("../server/server")
const { describe, beforeAll, afterAll, test, expect } = require("@jest/globals")
require("dotenv").config()

describe("Expense Tracker API Integration Tests", () => {
  let authToken
  let userId

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI)
  })

  afterAll(async () => {
    await mongoose.disconnect()
  })

  describe("Authentication", () => {
    test("Should register a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe(userData.email)
      authToken = response.body.token
      userId = response.body.user.id
    })

    test("Should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(200)

      expect(response.body.token).toBeDefined()
    })

    test("Should reject invalid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      }

      await request(app).post("/api/auth/login").send(loginData).expect(401)
    })
  })

  describe("Expenses", () => {
    test("Should add a new expense", async () => {
      const expenseData = {
        amount: 250,
        date: new Date().toISOString().split("T")[0],
        vendor: "Test Vendor",
        note: "Test expense",
      }

      const response = await request(app)
        .post("/api/expenses")
        .set("Authorization", `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201)

      expect(response.body.expense.amount).toBe(expenseData.amount)
      expect(response.body.expense.category).toBeDefined()
    })

    test("Should get user expenses", async () => {
      const response = await request(app).get("/api/expenses").set("Authorization", `Bearer ${authToken}`).expect(200)

      expect(response.body.expenses).toBeDefined()
      expect(Array.isArray(response.body.expenses)).toBe(true)
    })

    test("Should get monthly summary", async () => {
      const response = await request(app)
        .get("/api/expenses/summary/monthly")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.categoryTotals).toBeDefined()
      expect(response.body.budgetInfo).toBeDefined()
    })
  })

  describe("Budget Management", () => {
    test("Should update monthly budget", async () => {
      const budgetData = {
        monthlyBudget: 25000,
      }

      const response = await request(app)
        .put("/api/auth/budget")
        .set("Authorization", `Bearer ${authToken}`)
        .send(budgetData)
        .expect(200)

      expect(response.body.user.monthlyBudget).toBe(budgetData.monthlyBudget)
    })
  })
})
