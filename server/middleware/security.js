const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const crypto = require('crypto')

// Advanced rate limiting with different tiers
const createRateLimit = (windowMs, max, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    skipSuccessfulRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.round(windowMs / 1000)
      })
    }
  })
}

// Different rate limits for different endpoints
const rateLimits = {
  // Auth endpoints - stricter limits
  auth: createRateLimit(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  
  // Password reset - very strict
  passwordReset: createRateLimit(60 * 60 * 1000, 3), // 3 attempts per hour
  
  // API endpoints - moderate limits
  api: createRateLimit(15 * 60 * 1000, 100), // 100 requests per 15 minutes
  
  // File uploads - limited
  upload: createRateLimit(15 * 60 * 1000, 10), // 10 uploads per 15 minutes
  
  // General endpoints
  general: createRateLimit(15 * 60 * 1000, 200) // 200 requests per 15 minutes
}

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
})

// Request sanitization middleware
const sanitizeRequest = (req, res, next) => {
  // Remove potentially dangerous characters
  const sanitizeValue = (value) => {
    if (typeof value === 'string') {
      return value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                  .replace(/javascript:/gi, '')
                  .replace(/on\w+\s*=/gi, '')
    }
    return value
  }

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key])
          } else {
            obj[key] = sanitizeValue(obj[key])
          }
        }
      }
    }
  }

  sanitizeObject(req.body)
  sanitizeObject(req.query)
  next()
}

// Request ID middleware for tracking
const requestId = (req, res, next) => {
  req.id = crypto.randomUUID()
  res.setHeader('X-Request-ID', req.id)
  next()
}

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      id: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    }
    
    // Log to console (in production, you'd send this to a logging service)
    console.log(`[${logData.timestamp}] ${logData.method} ${logData.url} - ${logData.status} - ${logData.duration} - ${logData.ip}`)
  })
  
  next()
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error in request ${req.id}:`, err)
  
  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === 'production'
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: isProduction ? 'Invalid input data' : err.message
    })
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    })
  }
  
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate entry',
      details: isProduction ? 'Resource already exists' : err.message
    })
  }
  
  res.status(500).json({
    error: 'Internal Server Error',
    requestId: req.id,
    message: isProduction ? 'Something went wrong' : err.message
  })
}

module.exports = {
  rateLimits,
  securityHeaders,
  sanitizeRequest,
  requestId,
  requestLogger,
  errorHandler
}