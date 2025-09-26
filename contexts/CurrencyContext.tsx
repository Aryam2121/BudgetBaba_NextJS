"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CurrencyContextType {
  currency: string
  currencySymbol: string
  setCurrency: (currency: string) => void
  formatAmount: (amount: number) => string
  updateUserCurrency: (currency: string) => Promise<void>
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const currencyMap: Record<string, string> = {
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

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<string>('USD')
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    // Only run on client side
    setIsClient(true)
    
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const savedCurrency = localStorage.getItem('userCurrency')
      if (savedCurrency) {
        setCurrencyState(savedCurrency)
      }
    }
  }, [])

  const setCurrency = (newCurrency: string) => {
    setCurrencyState(newCurrency)
    if (typeof window !== 'undefined') {
      localStorage.setItem('userCurrency', newCurrency)
    }
  }

  const updateUserCurrency = async (newCurrency: string) => {
    try {
      // For now, just update locally
      // TODO: Integrate with API when ready
      setCurrency(newCurrency)
      return Promise.resolve()
    } catch (error) {
      console.error('Error updating user currency:', error)
      setCurrency(newCurrency)
      throw error
    }
  }

  const currencySymbol = currencyMap[currency] || currency

  const formatAmount = (amount: number): string => {
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

  return (
    <CurrencyContext.Provider value={{
      currency,
      currencySymbol,
      setCurrency,
      formatAmount,
      updateUserCurrency
    }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}