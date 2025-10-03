"use client"

import { useAuth } from '@/contexts/AuthContext'

export function useCurrency() {
  const { user } = useAuth()
  
  const formatCurrency = (amount: number) => {
    const currency = user?.currency || 'INR'
    
    const formatters: Record<string, Intl.NumberFormat> = {
      'INR': new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }),
      'USD': new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }),
      'EUR': new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }),
      'GBP': new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      })
    }
    
    const formatter = formatters[currency] || formatters['INR']
    return formatter.format(amount)
  }

  const getCurrencySymbol = () => {
    const currency = user?.currency || 'INR'
    const symbols: Record<string, string> = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    }
    return symbols[currency] || '₹'
  }

  const getCurrencyCode = () => {
    return user?.currency || 'INR'
  }

  return {
    formatCurrency,
    getCurrencySymbol,
    getCurrencyCode
  }
}