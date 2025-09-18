const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || "An error occurred" }
      }

      return { data }
    } catch (error) {
      return { error: "Network error. Please check your connection." }
    }
  }

  // Auth methods
  async register(userData: { name: string; email: string; password: string }) {
    return this.request<{ token: string; user: any }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    return this.request<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  // Google OAuth methods
  async getGoogleAuthUrl() {
    return this.request<{ authUrl: string }>("/auth/google", {
      method: "GET",
    })
  }

  async googleCallback(code: string) {
    return this.request<{ token: string; user: any }>("/auth/google/callback", {
      method: "POST",
      body: JSON.stringify({ code }),
    })
  }

  async updateBudget(monthlyBudget: number) {
    return this.request<{ user: any }>("/auth/budget", {
      method: "PUT",
      body: JSON.stringify({ monthlyBudget }),
    })
  }

  // Expense methods
  async getExpenses(filters?: { from?: string; to?: string; category?: string }) {
    const params = new URLSearchParams()
    if (filters?.from) params.append("from", filters.from)
    if (filters?.to) params.append("to", filters.to)
    if (filters?.category) params.append("category", filters.category)

    const queryString = params.toString()
    return this.request<any[]>(`/expenses${queryString ? `?${queryString}` : ""}`)
  }

  async addExpense(expenseData: {
    amount: number
    date: string
    note?: string
    vendor?: string
    category?: string
  }) {
    return this.request<any>("/expenses", {
      method: "POST",
      body: JSON.stringify(expenseData),
    })
  }

  async uploadExpenses(expenses: any[]) {
    return this.request<any>("/expenses/upload", {
      method: "POST",
      body: JSON.stringify({ expenses }),
    })
  }

  async getMonthlySummary() {
    return this.request<any>("/expenses/summary/monthly")
  }

  async getDashboardStats() {
    return this.request<any>("/expenses/dashboard/stats")
  }

  // Split methods
  async createSplit(splitData: {
    expenseId: string
    title: string
    description?: string
    participants: Array<{
      email: string
      name: string
      userId?: string
      amount?: number
      percentage?: number
    }>
    splitType?: "equal" | "exact" | "percentage"
    creatorAmount?: number
    creatorPercentage?: number
  }) {
    return this.request<any>("/splits", {
      method: "POST",
      body: JSON.stringify(splitData),
    })
  }

  async getSplits(filters?: { status?: "settled" | "unsettled"; type?: string }) {
    const params = new URLSearchParams()
    if (filters?.status) params.append("status", filters.status)
    if (filters?.type) params.append("type", filters.type)

    const queryString = params.toString()
    return this.request<any>(`/splits${queryString ? `?${queryString}` : ""}`)
  }

  async getSplitDetails(splitId: string) {
    return this.request<any>(`/splits/${splitId}`)
  }

  async markSplitAsPaid(splitId: string, participantEmail: string) {
    return this.request<any>(`/splits/${splitId}/participants/${encodeURIComponent(participantEmail)}/paid`, {
      method: "PATCH",
    })
  }

  async sendSplitReminder(splitId: string, participantEmail: string) {
    return this.request<any>(`/splits/${splitId}/participants/${encodeURIComponent(participantEmail)}/remind`, {
      method: "POST",
    })
  }

  async deleteSplit(splitId: string) {
    return this.request<any>(`/splits/${splitId}`, {
      method: "DELETE",
    })
  }

  // Email methods
  async getEmailStatus() {
    return this.request<any>("/email/status")
  }

  async getOAuthUrl(provider: "gmail" | "outlook") {
    return this.request<{ authUrl: string }>(`/email/${provider}/connect`)
  }

  async updateEmailPreferences(preferences: {
    sendFromPersonalEmail?: boolean
    preferredProvider?: "gmail" | "outlook" | "app"
    splitNotifications?: boolean
    settlementNotifications?: boolean
    reminderNotifications?: boolean
    fallbackToReplyTo?: boolean
  }) {
    return this.request<any>("/email/preferences", {
      method: "PUT",
      body: JSON.stringify(preferences),
    })
  }

  async disconnectEmailProvider(provider: "gmail" | "outlook") {
    return this.request<any>(`/email/disconnect/${provider}`, {
      method: "DELETE",
    })
  }

  async testEmailConnection(provider: "gmail" | "outlook") {
    return this.request<any>(`/email/test/${provider}`, {
      method: "POST",
    })
  }
}

export const api = new ApiClient(API_BASE_URL)
