// Middleware for real-time receipt processing progress
const cache = require('../services/cache');
const logger = require('../services/logger');

/**
 * Emit progress updates for receipt processing
 * @param {Object} io - Socket.IO instance
 * @param {string} userId - User ID
 * @param {string} receiptId - Receipt ID
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} status - Status message
 * @param {Object} data - Additional data
 */
const emitProgress = async (io, userId, receiptId, progress, status, data = {}) => {
  try {
    // Store progress in cache for polling fallback
    await cache.set(
      `receipt:progress:${receiptId}`,
      { progress, status, ...data },
      300 // 5 minutes TTL
    );

    // Emit real-time update via Socket.IO
    if (io) {
      io.to(`user:${userId}`).emit('receipt:progress', {
        receiptId,
        progress,
        status,
        timestamp: new Date().toISOString(),
        ...data
      });
    }

    logger.debug(`Receipt ${receiptId} progress: ${progress}% - ${status}`);
  } catch (error) {
    logger.error('Failed to emit progress:', error);
  }
};

/**
 * Get current progress for a receipt
 * @param {string} receiptId - Receipt ID
 * @returns {Promise<Object>} - Progress data
 */
const getProgress = async (receiptId) => {
  try {
    const progress = await cache.get(`receipt:progress:${receiptId}`);
    return progress || { progress: 0, status: 'unknown' };
  } catch (error) {
    logger.error('Failed to get progress:', error);
    return { progress: 0, status: 'error' };
  }
};

/**
 * Clear progress data for a receipt
 * @param {string} receiptId - Receipt ID
 */
const clearProgress = async (receiptId) => {
  try {
    await cache.del(`receipt:progress:${receiptId}`);
  } catch (error) {
    logger.error('Failed to clear progress:', error);
  }
};

module.exports = {
  emitProgress,
  getProgress,
  clearProgress
};
