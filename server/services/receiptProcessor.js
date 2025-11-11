const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { createWorker } = require('tesseract.js');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/receipts');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `receipt-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed'));
    }
  }
});

// Receipt processing service
class ReceiptProcessor {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      this.worker = await createWorker('eng');
      this.isInitialized = true;
      console.log('✅ Tesseract OCR worker initialized');
    } catch (error) {
      console.error('❌ Failed to initialize OCR worker:', error);
      throw error;
    }
  }

  async processReceipt(imagePath) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Extract text using OCR
      const { data: { text } } = await this.worker.recognize(imagePath);
      
      // Parse extracted text
      const parsedData = this.parseReceiptText(text);
      
      // Calculate confidence score
      const confidence = this.calculateConfidence(parsedData, text);

      return {
        success: true,
        data: {
          ...parsedData,
          rawText: text,
          confidence,
          processedAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Receipt processing error:', error);
      return {
        success: false,
        error: error.message || 'Failed to process receipt'
      };
    }
  }

  parseReceiptText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract vendor (usually first few lines)
    const vendor = this.extractVendor(lines);
    
    // Extract date
    const date = this.extractDate(text);
    
    // Extract total amount
    const amount = this.extractAmount(text);
    
    // Extract items
    const items = this.extractItems(lines);
    
    // Extract tax
    const taxAmount = this.extractTax(text);
    
    // Extract tip
    const tipAmount = this.extractTip(text);
    
    // Detect payment method
    const paymentMethod = this.extractPaymentMethod(text);
    
    // Suggest category
    const category = this.suggestCategory(vendor, items);

    return {
      vendor,
      date,
      amount,
      items,
      taxAmount,
      tipAmount,
      paymentMethod,
      category
    };
  }

  extractVendor(lines) {
    // Usually the first 1-3 non-empty lines contain vendor name
    const potentialVendors = lines.slice(0, 3).filter(line => 
      line.length > 2 && 
      !/^\d+$/.test(line) && 
      !line.toLowerCase().includes('receipt')
    );
    
    return potentialVendors[0] || 'Unknown Vendor';
  }

  extractDate(text) {
    // Common date patterns
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      /(\d{1,2}-\d{1,2}-\d{2,4})/,
      /(\d{4}-\d{1,2}-\d{1,2})/,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}/i,
      /(\d{1,2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const dateStr = match[0];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          continue;
        }
      }
    }

    // Default to today if no date found
    return new Date().toISOString().split('T')[0];
  }

  extractAmount(text) {
    // Look for total amount
    const patterns = [
      /total[:\s]+\$?(\d+\.\d{2})/i,
      /amount[:\s]+\$?(\d+\.\d{2})/i,
      /balance[:\s]+\$?(\d+\.\d{2})/i,
      /\$(\d+\.\d{2})\s*(total|amount)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    // If no total found, try to find largest amount
    const amounts = text.match(/\$?(\d+\.\d{2})/g) || [];
    if (amounts.length > 0) {
      const maxAmount = Math.max(...amounts.map(a => parseFloat(a.replace('$', ''))));
      return maxAmount;
    }

    return 0;
  }

  extractItems(lines) {
    const items = [];
    const itemPattern = /^(.+?)\s+\$?(\d+\.\d{2})$/;

    for (const line of lines) {
      const match = line.match(itemPattern);
      if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2]);
        
        // Skip if it looks like a total/subtotal/tax line
        if (!/total|subtotal|tax|tip|balance|change/i.test(name)) {
          items.push({
            name,
            quantity: 1,
            price
          });
        }
      }
    }

    return items;
  }

  extractTax(text) {
    const taxPattern = /tax[:\s]+\$?(\d+\.\d{2})/i;
    const match = text.match(taxPattern);
    return match ? parseFloat(match[1]) : 0;
  }

  extractTip(text) {
    const tipPattern = /tip[:\s]+\$?(\d+\.\d{2})/i;
    const match = text.match(tipPattern);
    return match ? parseFloat(match[1]) : 0;
  }

  extractPaymentMethod(text) {
    const methods = {
      'visa': /visa/i,
      'mastercard': /mastercard|mc/i,
      'amex': /amex|american express/i,
      'discover': /discover/i,
      'cash': /cash/i,
      'debit': /debit/i,
      'credit': /credit/i
    };

    for (const [method, pattern] of Object.entries(methods)) {
      if (pattern.test(text)) {
        return method.charAt(0).toUpperCase() + method.slice(1);
      }
    }

    return 'Unknown';
  }

  suggestCategory(vendor, items) {
    const vendorLower = vendor.toLowerCase();
    const itemsText = items.map(i => i.name.toLowerCase()).join(' ');
    
    // Category keywords
    const categories = {
      'Food & Dining': ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'diner', 'kitchen', 'grill', 'bar', 'pub'],
      'Groceries': ['grocery', 'market', 'supermarket', 'walmart', 'target', 'costco', 'trader', 'whole foods'],
      'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'metro', 'transit'],
      'Shopping': ['mall', 'store', 'shop', 'boutique', 'amazon', 'ebay'],
      'Entertainment': ['cinema', 'movie', 'theater', 'concert', 'ticket', 'game', 'amusement'],
      'Healthcare': ['pharmacy', 'hospital', 'clinic', 'doctor', 'medical', 'health', 'cvs', 'walgreens'],
      'Utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'utility'],
      'Travel': ['hotel', 'airline', 'airbnb', 'booking', 'flight', 'hostel']
    };

    const combinedText = vendorLower + ' ' + itemsText;

    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (combinedText.includes(keyword)) {
          return category;
        }
      }
    }

    return 'Other';
  }

  calculateConfidence(parsedData, rawText) {
    let score = 0;
    let maxScore = 0;

    // Vendor check
    maxScore += 20;
    if (parsedData.vendor && parsedData.vendor !== 'Unknown Vendor') {
      score += 20;
    }

    // Date check
    maxScore += 15;
    if (parsedData.date) {
      score += 15;
    }

    // Amount check
    maxScore += 30;
    if (parsedData.amount && parsedData.amount > 0) {
      score += 30;
    }

    // Items check
    maxScore += 20;
    if (parsedData.items && parsedData.items.length > 0) {
      score += 20;
    }

    // Text quality check
    maxScore += 15;
    const textLength = rawText.length;
    if (textLength > 50) {
      score += Math.min(15, Math.floor(textLength / 50));
    }

    return Math.round((score / maxScore) * 100) / 100;
  }

  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.isInitialized = false;
      console.log('✅ OCR worker terminated');
    }
  }
}

// Singleton instance
const receiptProcessor = new ReceiptProcessor();

// Cleanup on process exit
process.on('SIGINT', async () => {
  await receiptProcessor.cleanup();
  process.exit(0);
});

module.exports = {
  upload,
  receiptProcessor
};
