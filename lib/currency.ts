// Utility functions for currency formatting without context dependencies
export const currencyMap: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: '$',
  AUD: '$',
  INR: '₹',
  CNY: '¥',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RUB: '₽',
  KRW: '₩',
  SGD: '$',
  HKD: '$',
  MXN: '$',
  BRL: 'R$',
  ZAR: 'R',
  THB: '฿',
  TRY: '₺',
  ILS: '₪',
  AED: 'د.إ',
  SAR: '﷼'
}

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const currencySymbol = currencyMap[currency] || currency
  const formattedNumber = amount.toFixed(2)
  
  // Different formatting based on currency
  switch (currency) {
    case 'EUR':
      return `${formattedNumber} €`
    case 'INR':
      // Indian number format with commas
      return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    case 'JPY':
    case 'KRW':
      // No decimal places for these currencies
      return `${currencySymbol}${Math.round(amount).toLocaleString()}`
    case 'USD':
    case 'CAD':
    case 'AUD':
    case 'GBP':
    case 'SGD':
    case 'HKD':
      return `${currencySymbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    default:
      return `${currencySymbol}${formattedNumber}`
  }
}

export const getCurrencySymbol = (currency: string): string => {
  return currencyMap[currency] || currency
}