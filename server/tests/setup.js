// Test setup file
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-key-for-testing'
process.env.MONGODB_URI_TEST = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/expense-tracker-test'

// Suppress console logs during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

// Set longer timeout for database operations
jest.setTimeout(10000)
