"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  monthlyBudget: number
  currency?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithToken: (user: User, token: string) => void
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem("token")
    const savedUser = localStorage.getItem("user")

    if (savedToken && savedUser) {
      try {
        // Parse the token to check expiration
        const tokenData = JSON.parse(atob(savedToken.split('.')[1]))
        const currentTime = Date.now() / 1000
        
        if (tokenData.exp > currentTime) {
          setToken(savedToken)
          setUser(JSON.parse(savedUser))
        } else {
          // Token expired, clear storage
          localStorage.removeItem("token")
          localStorage.removeItem("user")
        }
      } catch (error) {
        // Invalid token format, clear storage
        console.error("Invalid token format:", error)
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await api.login({ email, password })

      if (response.error) {
        return { success: false, error: response.error }
      }

      const { token: newToken, user: userData } = response.data!

      // Save to localStorage
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(userData))

      // Update state
      setToken(newToken)
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error("Login error:", error)
      return { success: false, error: "Network error. Please check your connection and try again." }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true)
      const response = await api.register({ name, email, password })

      if (response.error) {
        return { success: false, error: response.error }
      }

      const { token: newToken, user: userData } = response.data!

      // Save to localStorage
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(userData))

      // Update state
      setToken(newToken)
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)
      return { success: false, error: "Network error. Please check your connection and try again." }
    } finally {
      setLoading(false)
    }
  }

  const loginWithToken = (userData: User, newToken: string) => {
    // Save to localStorage
    localStorage.setItem("token", newToken)
    localStorage.setItem("user", JSON.stringify(userData))

    // Update state
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, loginWithToken, register, logout, loading }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
