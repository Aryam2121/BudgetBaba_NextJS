const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const app = require('../server') // Will need to export app from server.js
const User = require('../models/User')

describe('Authentication API', () => {
  // Setup test database
  beforeAll(async () => {
    const testDB = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/expense-tracker-test'
    await mongoose.connect(testDB)
  })

  // Clean up after each test
  afterEach(async () => {
    await User.deleteMany({})
  })

  // Close database connection
  afterAll(async () => {
    await mongoose.connection.close()
  })

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser)
        .expect(201)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(newUser.email)
      expect(response.body.user.name).toBe(newUser.name)
      expect(response.body.user).not.toHaveProperty('passwordHash')
    })

    it('should reject registration with missing fields', async () => {
      const invalidUser = {
        email: 'test@example.com'
        // Missing name and password
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('required')
    })

    it('should reject registration with short password', async () => {
      const invalidUser = {
        name: 'Test User',
        email: 'test@example.com',
        password: '12345' // Only 5 characters
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidUser)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('6 characters')
    })

    it('should reject duplicate email registration', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('already exists')
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        })
    })

    it('should login successfully with correct credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(credentials.email)
      
      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET)
      expect(decoded).toHaveProperty('userId')
    })

    it('should reject login with wrong password', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid')
    })

    it('should reject login with non-existent email', async () => {
      const credentials = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(credentials)
        .expect(401)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('Invalid')
    })

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400)

      expect(response.body).toHaveProperty('error')
      expect(response.body.error).toContain('required')
    })
  })

  describe('Rate Limiting', () => {
    it('should allow up to 100 requests within 15 minutes', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      // Make 10 requests (should all succeed or fail with 401, not 429)
      const requests = Array(10).fill(null).map(() =>
        request(app)
          .post('/api/auth/login')
          .send(credentials)
      )

      const responses = await Promise.all(requests)
      
      // None should be rate limited (429)
      responses.forEach(response => {
        expect(response.status).not.toBe(429)
      })
    })
  })
})
