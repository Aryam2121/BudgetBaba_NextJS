const express = require('express');
const router = express.Router();
const currencyConverter = require('../services/currencyConverter');
const authMiddleware = require('../middleware/auth');

// Get all supported currencies and current rates
router.get('/rates', authMiddleware, async (req, res) => {
  try {
    const rates = await currencyConverter.getRates();
    const cacheInfo = currencyConverter.getCacheInfo();
    const supportedCurrencies = currencyConverter.getSupportedCurrencies();

    res.json({
      success: true,
      baseCurrency: 'USD',
      rates,
      supportedCurrencies,
      cache: cacheInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching currency rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch currency rates'
    });
  }
});

// Convert amount between currencies
router.post('/convert', authMiddleware, async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    // Validation
    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: amount, from, to'
      });
    }

    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const convertedAmount = await currencyConverter.convert(
      parseFloat(amount),
      from.toUpperCase(),
      to.toUpperCase()
    );

    const rate = await currencyConverter.getRate(
      from.toUpperCase(),
      to.toUpperCase()
    );

    res.json({
      success: true,
      conversion: {
        amount: parseFloat(amount),
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        result: convertedAmount,
        rate,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to convert currency'
    });
  }
});

// Convert amount to multiple currencies
router.post('/convert-multiple', authMiddleware, async (req, res) => {
  try {
    const { amount, from, to } = req.body;

    // Validation
    if (!amount || !from || !Array.isArray(to) || to.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid fields: amount (number), from (string), to (array)'
      });
    }

    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid amount'
      });
    }

    const results = await currencyConverter.convertMultiple(
      parseFloat(amount),
      from.toUpperCase(),
      to.map(c => c.toUpperCase())
    );

    res.json({
      success: true,
      conversions: {
        amount: parseFloat(amount),
        from: from.toUpperCase(),
        results,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error converting to multiple currencies:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to convert currency'
    });
  }
});

// Get exchange rate between two currencies
router.get('/rate/:from/:to', authMiddleware, async (req, res) => {
  try {
    const { from, to } = req.params;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Missing currency codes'
      });
    }

    const rate = await currencyConverter.getRate(
      from.toUpperCase(),
      to.toUpperCase()
    );

    if (rate === null) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported currency pair'
      });
    }

    res.json({
      success: true,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      inverse: 1 / rate,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rate'
    });
  }
});

// Get list of supported currencies with names
router.get('/supported', async (req, res) => {
  try {
    const currencyNames = {
      USD: 'US Dollar',
      EUR: 'Euro',
      GBP: 'British Pound',
      JPY: 'Japanese Yen',
      CAD: 'Canadian Dollar',
      AUD: 'Australian Dollar',
      INR: 'Indian Rupee',
      CNY: 'Chinese Yuan',
      CHF: 'Swiss Franc',
      SEK: 'Swedish Krona',
      NOK: 'Norwegian Krone',
      DKK: 'Danish Krone',
      PLN: 'Polish Złoty',
      CZK: 'Czech Koruna',
      HUF: 'Hungarian Forint',
      RUB: 'Russian Ruble',
      KRW: 'South Korean Won',
      SGD: 'Singapore Dollar',
      HKD: 'Hong Kong Dollar',
      MXN: 'Mexican Peso',
      BRL: 'Brazilian Real',
      ZAR: 'South African Rand',
      THB: 'Thai Baht',
      TRY: 'Turkish Lira',
      ILS: 'Israeli Shekel',
      AED: 'UAE Dirham',
      SAR: 'Saudi Riyal'
    };

    const supported = currencyConverter.getSupportedCurrencies().map(code => ({
      code,
      name: currencyNames[code] || code
    }));

    res.json({
      success: true,
      currencies: supported,
      count: supported.length
    });
  } catch (error) {
    console.error('Error fetching supported currencies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported currencies'
    });
  }
});

// Refresh currency rates (manual trigger)
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const success = await currencyConverter.fetchRates();
    const cacheInfo = currencyConverter.getCacheInfo();

    res.json({
      success,
      message: success ? 'Currency rates refreshed successfully' : 'Failed to refresh rates, using cache',
      cache: cacheInfo
    });
  } catch (error) {
    console.error('Error refreshing currency rates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh currency rates'
    });
  }
});

module.exports = router;
