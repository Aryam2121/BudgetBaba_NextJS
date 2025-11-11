const axios = require('axios');

// Currency conversion service with caching
class CurrencyConverter {
  constructor() {
    this.rates = {};
    this.lastUpdate = null;
    this.cacheExpiry = 60 * 60 * 1000; // 1 hour
    this.baseCurrency = 'USD';
    
    // API keys - use environment variable or fallback to free tier
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || null;
  }

  async fetchRates() {
    try {
      // Use exchangerate-api.com (free tier: 1500 requests/month)
      const url = this.apiKey 
        ? `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest/${this.baseCurrency}`
        : `https://api.exchangerate-api.com/v4/latest/${this.baseCurrency}`;
      
      const response = await axios.get(url);
      
      if (response.data && response.data.rates) {
        this.rates = response.data.rates;
        this.lastUpdate = Date.now();
        console.log(`✅ Currency rates updated: ${Object.keys(this.rates).length} currencies`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Failed to fetch currency rates:', error.message);
      
      // Fallback to static rates if API fails
      if (Object.keys(this.rates).length === 0) {
        this.loadFallbackRates();
      }
      
      return false;
    }
  }

  loadFallbackRates() {
    // Fallback rates (approximate, updated monthly)
    this.rates = {
      USD: 1.0,
      EUR: 0.92,
      GBP: 0.79,
      JPY: 149.50,
      CAD: 1.36,
      AUD: 1.53,
      INR: 83.12,
      CNY: 7.24,
      CHF: 0.88,
      SEK: 10.87,
      NOK: 10.96,
      DKK: 6.88,
      PLN: 4.05,
      CZK: 23.23,
      HUF: 357.90,
      RUB: 92.50,
      KRW: 1320.50,
      SGD: 1.34,
      HKD: 7.82,
      MXN: 17.15,
      BRL: 4.98,
      ZAR: 18.75,
      THB: 35.60,
      TRY: 32.25,
      ILS: 3.66,
      AED: 3.67,
      SAR: 3.75
    };
    this.lastUpdate = Date.now();
    console.log('⚠️  Using fallback currency rates');
  }

  async getRates() {
    // Return cached rates if still valid
    if (this.rates && Object.keys(this.rates).length > 0) {
      const cacheAge = Date.now() - (this.lastUpdate || 0);
      if (cacheAge < this.cacheExpiry) {
        return this.rates;
      }
    }

    // Fetch fresh rates
    await this.fetchRates();
    return this.rates;
  }

  async convert(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getRates();
    
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
    }

    // Convert from -> USD -> to
    const amountInUSD = amount / rates[fromCurrency];
    const convertedAmount = amountInUSD * rates[toCurrency];

    return Math.round(convertedAmount * 100) / 100;
  }

  async convertMultiple(amount, fromCurrency, toCurrencies) {
    const rates = await this.getRates();
    const results = {};

    for (const toCurrency of toCurrencies) {
      try {
        results[toCurrency] = await this.convert(amount, fromCurrency, toCurrency);
      } catch (error) {
        results[toCurrency] = null;
      }
    }

    return results;
  }

  async getRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) {
      return 1.0;
    }

    const rates = await this.getRates();
    
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      return null;
    }

    return (rates[toCurrency] / rates[fromCurrency]);
  }

  getSupportedCurrencies() {
    return Object.keys(this.rates).sort();
  }

  getCacheInfo() {
    const age = Date.now() - (this.lastUpdate || 0);
    return {
      lastUpdate: this.lastUpdate ? new Date(this.lastUpdate).toISOString() : null,
      cacheAge: Math.floor(age / 1000), // seconds
      cacheExpiry: this.cacheExpiry / 1000, // seconds
      isValid: age < this.cacheExpiry,
      currencyCount: Object.keys(this.rates).length
    };
  }
}

// Singleton instance
const currencyConverter = new CurrencyConverter();

// Initialize rates on startup
currencyConverter.fetchRates().catch(err => {
  console.error('Failed to initialize currency rates:', err.message);
  currencyConverter.loadFallbackRates();
});

// Update rates every hour
setInterval(() => {
  currencyConverter.fetchRates();
}, 60 * 60 * 1000);

module.exports = currencyConverter;
