const express = require('express');
const router = express.Router();
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { upload, receiptProcessor } = require('../services/receiptProcessor');
const fs = require('fs').promises;

// Process receipt image
router.post('/process', authMiddleware, upload.single('receipt'), async (req, res) => {
  let filePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No receipt image provided'
      });
    }

    filePath = req.file.path;
    console.log(`Processing receipt: ${filePath}`);

    // Process the receipt
    const result = await receiptProcessor.processReceipt(filePath);

    if (!result.success) {
      return res.status(500).json(result);
    }

    // Add file URL to response
    const fileUrl = `/uploads/receipts/${req.file.filename}`;
    result.data.imageUrl = fileUrl;
    result.data.filename = req.file.filename;

    // Add AI suggestions
    result.data.suggestions = generateSuggestions(result.data);

    res.json({
      success: true,
      data: result.data,
      message: 'Receipt processed successfully'
    });

  } catch (error) {
    console.error('Receipt processing error:', error);
    
    // Clean up uploaded file on error
    if (filePath) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.error('Failed to clean up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process receipt'
    });
  }
});

// Get receipt processing history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    // This would query a Receipt model if we implement persistent storage
    // For now, return empty array
    res.json({
      success: true,
      receipts: [],
      message: 'Receipt history feature coming soon'
    });
  } catch (error) {
    console.error('Error fetching receipt history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch receipt history'
    });
  }
});

// Delete receipt image
router.delete('/:filename', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename (security check)
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid filename'
      });
    }

    const filePath = path.join(__dirname, '../../uploads/receipts', filename);
    
    try {
      await fs.unlink(filePath);
      res.json({
        success: true,
        message: 'Receipt deleted successfully'
      });
    } catch (error) {
      if (error.code === 'ENOENT') {
        return res.status(404).json({
          success: false,
          error: 'Receipt not found'
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete receipt'
    });
  }
});

// Test OCR endpoint (for testing only)
router.get('/test', authMiddleware, async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Receipt OCR service is running',
      features: {
        ocr: 'Tesseract.js',
        supportedFormats: ['JPG', 'PNG', 'WEBP'],
        maxFileSize: '10MB',
        extractedFields: [
          'vendor',
          'date',
          'amount',
          'items',
          'tax',
          'tip',
          'paymentMethod',
          'category'
        ]
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Service unavailable'
    });
  }
});

// Helper function to generate AI suggestions
function generateSuggestions(data) {
  const suggestions = [];

  // Check if amount is suspiciously high
  if (data.amount > 1000) {
    suggestions.push('This is a large transaction. Consider splitting it if it includes multiple categories.');
  }

  // Check if date is in the future
  if (data.date && new Date(data.date) > new Date()) {
    suggestions.push('Date appears to be in the future. Please verify the date.');
  }

  // Check if items could be categorized better
  if (data.items && data.items.length > 5) {
    suggestions.push('Multiple items detected. Consider creating detailed line items in your expense tracker.');
  }

  // Tax check
  if (data.taxAmount && data.amount > 0) {
    const taxRate = (data.taxAmount / (data.amount - data.taxAmount)) * 100;
    if (taxRate > 15) {
      suggestions.push(`High tax rate detected (${taxRate.toFixed(1)}%). Verify if this is correct.`);
    }
  }

  // Tip check
  if (data.tipAmount && data.amount > 0) {
    const tipRate = (data.tipAmount / (data.amount - data.tipAmount - (data.taxAmount || 0))) * 100;
    if (tipRate > 25) {
      suggestions.push(`Generous tip (${tipRate.toFixed(1)}%)! 🎉`);
    } else if (tipRate < 10 && tipRate > 0) {
      suggestions.push(`Low tip detected (${tipRate.toFixed(1)}%). Consider if this is correct.`);
    }
  }

  // Category suggestion
  if (data.category && data.category !== 'Other') {
    suggestions.push(`Automatically categorized as "${data.category}". Change if needed.`);
  }

  return suggestions;
}

module.exports = router;
