const Redis = require('ioredis')
const logger = require('./logger')

class CacheService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.initialize()
  }

  initialize() {
    try {
      // Try to connect to Redis if REDIS_URL is provided
      if (process.env.REDIS_URL) {
        this.client = new Redis(process.env.REDIS_URL, {
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000)
            return delay
          },
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
        })

        this.client.on('connect', () => {
          this.isConnected = true
          logger.info('✅ Redis cache connected')
        })

        this.client.on('error', (err) => {
          this.isConnected = false
          logger.warn('⚠️  Redis connection error (falling back to memory cache):', err.message)
        })

        this.client.on('close', () => {
          this.isConnected = false
          logger.warn('⚠️  Redis connection closed')
        })
      } else {
        logger.info('ℹ️  No REDIS_URL found, using in-memory cache')
      }
    } catch (error) {
      logger.error('❌ Failed to initialize Redis:', error)
      this.isConnected = false
    }
  }

  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any>} - Cached value or null
   */
  async get(key) {
    try {
      if (!this.isConnected || !this.client) {
        return null
      }

      const value = await this.client.get(key)
      if (!value) return null

      return JSON.parse(value)
    } catch (error) {
      logger.error(`Cache GET error for key ${key}:`, error)
      return null
    }
  }

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time to live in seconds (default: 1 hour)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = 3600) {
    try {
      if (!this.isConnected || !this.client) {
        return false
      }

      const serialized = JSON.stringify(value)
      await this.client.setex(key, ttl, serialized)
      return true
    } catch (error) {
      logger.error(`Cache SET error for key ${key}:`, error)
      return false
    }
  }

  /**
   * Delete value from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Success status
   */
  async del(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false
      }

      await this.client.del(key)
      return true
    } catch (error) {
      logger.error(`Cache DEL error for key ${key}:`, error)
      return false
    }
  }

  /**
   * Delete all keys matching a pattern
   * @param {string} pattern - Key pattern (e.g., 'user:*')
   * @returns {Promise<boolean>} - Success status
   */
  async delPattern(pattern) {
    try {
      if (!this.isConnected || !this.client) {
        return false
      }

      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(...keys)
      }
      return true
    } catch (error) {
      logger.error(`Cache DEL pattern error for ${pattern}:`, error)
      return false
    }
  }

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>} - Existence status
   */
  async exists(key) {
    try {
      if (!this.isConnected || !this.client) {
        return false
      }

      const exists = await this.client.exists(key)
      return exists === 1
    } catch (error) {
      logger.error(`Cache EXISTS error for key ${key}:`, error)
      return false
    }
  }

  /**
   * Get multiple keys at once
   * @param {string[]} keys - Array of cache keys
   * @returns {Promise<Object>} - Object with key-value pairs
   */
  async mget(keys) {
    try {
      if (!this.isConnected || !this.client || keys.length === 0) {
        return {}
      }

      const values = await this.client.mget(...keys)
      const result = {}
      
      keys.forEach((key, index) => {
        if (values[index]) {
          try {
            result[key] = JSON.parse(values[index])
          } catch (e) {
            result[key] = null
          }
        } else {
          result[key] = null
        }
      })

      return result
    } catch (error) {
      logger.error('Cache MGET error:', error)
      return {}
    }
  }

  /**
   * Increment a counter
   * @param {string} key - Cache key
   * @param {number} amount - Amount to increment (default: 1)
   * @returns {Promise<number>} - New value
   */
  async incr(key, amount = 1) {
    try {
      if (!this.isConnected || !this.client) {
        return 0
      }

      const value = await this.client.incrby(key, amount)
      return value
    } catch (error) {
      logger.error(`Cache INCR error for key ${key}:`, error)
      return 0
    }
  }

  /**
   * Get cache statistics
   * @returns {Promise<Object>} - Cache stats
   */
  async getStats() {
    try {
      if (!this.isConnected || !this.client) {
        return { connected: false, keys: 0 }
      }

      const info = await this.client.info('stats')
      const dbsize = await this.client.dbsize()

      return {
        connected: true,
        keys: dbsize,
        info: info,
      }
    } catch (error) {
      logger.error('Cache STATS error:', error)
      return { connected: false, keys: 0 }
    }
  }

  /**
   * Flush all cache data (use with caution!)
   * @returns {Promise<boolean>} - Success status
   */
  async flushAll() {
    try {
      if (!this.isConnected || !this.client) {
        return false
      }

      await this.client.flushall()
      logger.warn('⚠️  Cache flushed (all data cleared)')
      return true
    } catch (error) {
      logger.error('Cache FLUSH error:', error)
      return false
    }
  }

  /**
   * Close Redis connection
   */
  async close() {
    try {
      if (this.client) {
        await this.client.quit()
        this.isConnected = false
        logger.info('Redis connection closed')
      }
    } catch (error) {
      logger.error('Error closing Redis connection:', error)
    }
  }
}

// Export singleton instance
module.exports = new CacheService()
