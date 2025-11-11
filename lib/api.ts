const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  status?: number
}

interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

interface RequestOptions extends RequestInit {
  timeout?: number
  retries?: number
}

class ApiClient {
  private baseURL: string
  private defaultTimeout = 10000 // 10 seconds
  private defaultRetries = 3

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { timeout = this.defaultTimeout, retries = this.defaultRetries, ...fetchOptions } = options
    const url = `${this.baseURL}${endpoint}`
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)
        
        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)

        // Handle empty responses
        let data
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          data = await response.json()
        } else {
          data = await response.text()
        }

        if (!response.ok) {
          // Handle authentication errors
          if (response.status === 401) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("token")
              window.location.href = "/auth/login"
            }
            return { 
              error: "Authentication required", 
              status: 401 
            }
          }

          return { 
            error: data?.error || data?.message || `HTTP ${response.status}`, 
            status: response.status 
          }
        }

        return { data, status: response.status }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          if (attempt === retries) {
            return { error: "Request timeout. Please try again.", status: 408 }
          }
          continue
        }

        if (attempt === retries) {
          return { 
            error: error.message || "Network error. Please check your connection.", 
            status: 0 
          }
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    return { error: "Max retries exceeded", status: 0 }
  }

  private buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(`${key}[]`, String(v)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    return searchParams.toString()
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

  async logout() {
    const result = await this.request<{}>("/auth/logout", {
      method: "POST",
    })
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
    
    return result
  }

  async getProfile() {
    return this.request<any>("/auth/profile")
  }

  async updateProfile(userData: { name?: string; email?: string; currency?: string }) {
    return this.request<any>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
  }

  async updateCurrency(currency: string) {
    return this.request<{ user: any }>("/auth/currency", {
      method: "PUT",
      body: JSON.stringify({ currency }),
    })
  }

  async changePassword(passwords: { currentPassword: string; newPassword: string }) {
    return this.request<{}>("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(passwords),
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

  async updateUserBudget(monthlyBudget: number) {
    return this.request<{ user: any }>("/auth/budget", {
      method: "PUT",
      body: JSON.stringify({ monthlyBudget }),
    })
  }

  // Expense methods
  async getExpenses(filters?: { 
    from?: string 
    to?: string 
    category?: string
    search?: string
    sortBy?: 'date' | 'amount' | 'category'
    sortOrder?: 'asc' | 'desc'
    page?: number
    limit?: number
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<PaginatedResponse<any>>(`/expenses${queryString ? `?${queryString}` : ""}`)
  }

  async getExpense(id: string) {
    return this.request<any>(`/expenses/${id}`)
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

  async updateExpense(id: string, expenseData: {
    amount?: number
    date?: string
    note?: string
    vendor?: string
    category?: string
  }) {
    return this.request<any>(`/expenses/${id}`, {
      method: "PUT",
      body: JSON.stringify(expenseData),
    })
  }

  async deleteExpense(id: string) {
    return this.request<{}>(`/expenses/${id}`, {
      method: "DELETE",
    })
  }

  async uploadExpenses(expenses: any[]) {
    return this.request<any>("/expenses/upload", {
      method: "POST",
      body: JSON.stringify({ expenses }),
    })
  }

  async getExpenseCategories() {
    // Legacy method - returns list of expense categories
    return this.request<string[]>("/expenses/categories")
  }

  async getMonthlySummary(year?: number, month?: number) {
    const params = year && month ? this.buildQueryString({ year, month }) : ''
    return this.request<any>(`/expenses/summary/monthly${params ? `?${params}` : ''}`)
  }

  async getYearlySummary(year?: number) {
    const params = year ? this.buildQueryString({ year }) : ''
    return this.request<any>(`/expenses/summary/yearly${params ? `?${params}` : ''}`)
  }

  async getDashboardStats() {
    return this.request<any>("/expenses/dashboard/stats")
  }

  async getExpenseAnalytics(filters?: {
    from?: string
    to?: string
    groupBy?: 'day' | 'week' | 'month' | 'category'
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/expenses/analytics${queryString ? `?${queryString}` : ""}`)
  }

  // Analytics methods
  async getExpenseTrends(filters?: { period?: string }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/trends${queryString ? `?${queryString}` : ""}`)
  }

  async getCategoryInsights(filters?: { period?: string }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/categories${queryString ? `?${queryString}` : ""}`)
  }

  async getSpendingComparison(filters?: { period?: string }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/comparison${queryString ? `?${queryString}` : ""}`)
  }

  async getAnalyticsInsights(filters?: { period?: string }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/insights${queryString ? `?${queryString}` : ""}`)
  }

  async getSpendingPredictions(filters?: { period?: string }) {
    // This method doesn't exist in backend, so we'll use budget analytics for now
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/budget${queryString ? `?${queryString}` : ""}`)
  }

  async getBudgetAnalyticsData(filters?: { period?: string }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/budget${queryString ? `?${queryString}` : ""}`)
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

  async getSplits(filters?: { 
    status?: "settled" | "unsettled" 
    type?: string
    page?: number
    limit?: number
    search?: string
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<PaginatedResponse<any>>(`/splits${queryString ? `?${queryString}` : ""}`)
  }

  async getSplitDetails(splitId: string) {
    return this.request<any>(`/splits/${splitId}`)
  }

  async updateSplit(splitId: string, splitData: {
    title?: string
    description?: string
    participants?: Array<{
      email: string
      name: string
      userId?: string
      amount?: number
      percentage?: number
    }>
  }) {
    return this.request<any>(`/splits/${splitId}`, {
      method: "PUT",
      body: JSON.stringify(splitData),
    })
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

  async getSplitSummary() {
    return this.request<any>("/splits/summary")
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

  // Analytics methods
  async getAdvancedAnalytics(filters?: {
    startDate?: string
    endDate?: string
    period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    categories?: string[]
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/expenses${queryString ? `?${queryString}` : ""}`)
  }

  async getSpendingTrends(filters?: { 
    period?: 'daily' | 'weekly' | 'monthly'
    months?: number 
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/spending-trends${queryString ? `?${queryString}` : ""}`)
  }

  async getPeriodComparison(filters?: {
    currentStart?: string
    currentEnd?: string
    compareStart?: string
    compareEnd?: string
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/period-comparison${queryString ? `?${queryString}` : ""}`)
  }

  async getVendorAnalysis(filters?: { limit?: number; minTransactions?: number }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/analytics/vendors${queryString ? `?${queryString}` : ""}`)
  }

  async getSpendingPatterns() {
    return this.request<any>("/analytics/spending-patterns")
  }

  async getAdvancedBudgetAnalytics() {
    return this.request<any>("/analytics/budget")
  }

  async getSmartInsights() {
    return this.request<any>("/analytics/insights")
  }

  // Notifications methods
  async getNotifications(filters?: {
    type?: string
    isRead?: boolean
    priority?: 'low' | 'medium' | 'high'
    page?: number
    limit?: number
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<PaginatedResponse<any>>(`/notifications${queryString ? `?${queryString}` : ""}`)
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<any>(`/notifications/${notificationId}/read`, {
      method: "PATCH",
    })
  }

  async markAllNotificationsAsRead() {
    return this.request<any>("/notifications/mark-all-read", {
      method: "PATCH",
    })
  }

  async deleteNotification(notificationId: string) {
    return this.request<any>(`/notifications/${notificationId}`, {
      method: "DELETE",
    })
  }

  async getNotificationSettings() {
    return this.request<any>("/notifications/settings")
  }

  async updateNotificationSettings(settings: {
    email?: boolean
    push?: boolean
    inApp?: boolean
    emailNotifications?: boolean
    pushNotifications?: boolean
    soundEnabled?: boolean
    budgetAlerts?: boolean
    goalReminders?: boolean
    expenseAlerts?: boolean
    splitNotifications?: boolean
    systemUpdates?: boolean
    achievementBadges?: boolean
    weeklyReports?: boolean
    monthlyReports?: boolean
    quietHours?: {
      enabled: boolean
      start: string
      end: string
    }
    types?: {
      split_created?: boolean
      split_updated?: boolean
      payment_reminder?: boolean
      goal_milestone?: boolean
      budget_alert?: boolean
      recurring_processed?: boolean
    }
  }) {
    return this.request<any>("/notifications/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
  }

  async handleNotificationAction(notificationId: string, actionId: string) {
    return this.request<any>(`/notifications/${notificationId}/actions/${actionId}`, {
      method: "POST",
    })
  }

  // Goals methods
  async getGoals(filters?: {
    status?: 'active' | 'completed' | 'paused'
    type?: string
    sort?: string
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/goals${queryString ? `?${queryString}` : ""}`)
  }

  async createGoal(goalData: {
    title: string
    description?: string
    type: string
    targetAmount: number
    targetDate: string
    category?: string
    priority?: 'low' | 'medium' | 'high'
    reminderFrequency?: 'daily' | 'weekly' | 'monthly'
    autoSave?: { enabled: boolean; amount?: number; frequency?: string }
  }) {
    return this.request<any>("/goals", {
      method: "POST",
      body: JSON.stringify(goalData),
    })
  }

  async updateGoal(goalId: string, goalData: {
    title?: string
    description?: string
    targetAmount?: number
    targetDate?: string
    status?: 'active' | 'completed' | 'paused'
  }) {
    return this.request<any>(`/goals/${goalId}`, {
      method: "PUT",
      body: JSON.stringify(goalData),
    })
  }

  async deleteGoal(goalId: string) {
    return this.request<any>(`/goals/${goalId}`, {
      method: "DELETE",
    })
  }

  async addGoalProgress(goalId: string, progressData: {
    amount: number
    note?: string
  }) {
    return this.request<any>(`/goals/${goalId}/progress`, {
      method: "POST",
      body: JSON.stringify(progressData),
    })
  }

  async getGoalAnalytics() {
    return this.request<any>("/goals/analytics")
  }

  // Recurring transactions methods
  async getRecurringTransactions(filters?: {
    isActive?: boolean
    type?: 'expense' | 'income'
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    page?: number
    limit?: number
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<PaginatedResponse<any>>(`/recurring${queryString ? `?${queryString}` : ""}`)
  }

  async createRecurringTransaction(transactionData: {
    title: string
    description?: string
    amount: number
    category: string
    type: 'expense' | 'income'
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    startDate: string
    endDate?: string
    autoProcess?: boolean
    notifications?: { enabled: boolean; daysBefore: number }
    tags?: string[]
  }) {
    return this.request<any>("/recurring", {
      method: "POST",
      body: JSON.stringify(transactionData),
    })
  }

  async updateRecurringTransaction(transactionId: string, transactionData: {
    title?: string
    description?: string
    amount?: number
    frequency?: string
    isActive?: boolean
    notifications?: { enabled: boolean; daysBefore: number }
  }) {
    return this.request<any>(`/recurring/${transactionId}`, {
      method: "PUT",
      body: JSON.stringify(transactionData),
    })
  }

  async deleteRecurringTransaction(transactionId: string) {
    return this.request<any>(`/recurring/${transactionId}`, {
      method: "DELETE",
    })
  }

  async processRecurringTransactions(transactionIds?: string[]) {
    return this.request<any>("/recurring/process", {
      method: "POST",
      body: JSON.stringify({ transactionIds }),
    })
  }

  async getRecurringAnalytics() {
    return this.request<any>("/recurring/analytics")
  }

  // Budget methods
  async getBudgets(filters?: {
    isActive?: boolean
    period?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    status?: 'good' | 'warning' | 'critical' | 'exceeded'
    page?: number
    limit?: number
  }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<PaginatedResponse<any>>(`/budgets${queryString ? `?${queryString}` : ""}`)
  }

  async getBudget(budgetId: string) {
    return this.request<any>(`/budgets/${budgetId}`)
  }

  async createBudget(budgetData: {
    name: string
    description?: string
    period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    startDate: string
    endDate: string
    totalAmount: number
    categories: Array<{
      category: string
      budgetAmount: number
      alertThreshold?: number
    }>
    alertSettings?: {
      enabled: boolean
      thresholds: Array<{ percentage: number; notified: boolean }>
    }
    autoRollover?: boolean
    tags?: string[]
  }) {
    return this.request<any>("/budgets", {
      method: "POST",
      body: JSON.stringify(budgetData),
    })
  }

  async updateBudget(budgetId: string, budgetData: {
    name?: string
    description?: string
    totalAmount?: number
    categories?: Array<{
      category: string
      budgetAmount: number
      alertThreshold?: number
    }>
    isActive?: boolean
  }) {
    return this.request<any>(`/budgets/${budgetId}`, {
      method: "PUT",
      body: JSON.stringify(budgetData),
    })
  }

  async deleteBudget(budgetId: string) {
    return this.request<any>(`/budgets/${budgetId}`, {
      method: "DELETE",
    })
  }

  async getBudgetAnalytics(filters?: { period?: string }) {
    const queryString = filters ? this.buildQueryString(filters) : ''
    return this.request<any>(`/budgets/analytics/overview${queryString ? `?${queryString}` : ""}`)
  }

  async checkBudgetAlerts() {
    return this.request<any>("/budgets/alerts/check")
  }

  // Export methods
  async exportExpenses(exportData: {
    format?: 'csv' | 'json'
    startDate?: string
    endDate?: string
    category?: string
    minAmount?: number
    maxAmount?: number
  }) {
    const response = await fetch(`${this.baseURL}/exports/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(exportData),
    })

    if (response.ok) {
      const blob = await response.blob()
      const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'expenses.csv'
      return { data: { blob, filename } }
    } else {
      const error = await response.json()
      return { error: error.error || 'Export failed' }
    }
  }

  async exportSplits(exportData: {
    format?: 'csv' | 'json'
    status?: string
    startDate?: string
    endDate?: string
  }) {
    const response = await fetch(`${this.baseURL}/exports/splits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(exportData),
    })

    if (response.ok) {
      const blob = await response.blob()
      const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'splits.csv'
      return { data: { blob, filename } }
    } else {
      const error = await response.json()
      return { error: error.error || 'Export failed' }
    }
  }

  async exportAllData(format: 'csv' | 'json' = 'json') {
    const response = await fetch(`${this.baseURL}/exports/all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ format }),
    })

    if (response.ok) {
      const blob = await response.blob()
      const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || `data-export.${format}`
      return { data: { blob, filename } }
    } else {
      const error = await response.json()
      return { error: error.error || 'Export failed' }
    }
  }

  async getExportHistory(page?: number, limit?: number) {
    const queryString = this.buildQueryString({ page, limit })
    return this.request<PaginatedResponse<any>>(`/exports/history${queryString ? `?${queryString}` : ""}`)
  }

  async generateReport(reportData: {
    reportType?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'
    startDate?: string
    endDate?: string
    includeCharts?: boolean
  }) {
    return this.request<any>("/exports/report", {
      method: "POST",
      body: JSON.stringify(reportData),
    })
  }

  // AI Receipt Processing
  async processReceipt(formData: FormData) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    
    const response = await fetch(`${this.baseURL}/ai/process-receipt`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (response.ok) {
      return await response.json()
    } else {
      const error = await response.json()
      return { error: error.error || 'Receipt processing failed' }
    }
  }

  async getReceiptHistory(params?: { page?: number; limit?: number }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<PaginatedResponse<any>>(`/ai/receipts${queryString ? `?${queryString}` : ""}`)
  }

  // Dashboard methods
  async getRecentActivity(params?: { limit?: number }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<any>(`/dashboard/activity${queryString ? `?${queryString}` : ""}`)
  }

  async getQuickInsights(params?: { timeRange?: number }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<any>(`/dashboard/insights${queryString ? `?${queryString}` : ""}`)
  }

  async getDashboardCharts(params?: { timeRange?: number }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<any>(`/dashboard/charts${queryString ? `?${queryString}` : ""}`)
  }

  async getBudgetInsights(params?: { timeRange?: number }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<any>(`/budgets/insights${queryString ? `?${queryString}` : ""}`)
  }

  async getBudgetHealth(params?: { timeRange?: number }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<any>(`/budgets/health${queryString ? `?${queryString}` : ""}`)
  }

  async getSmartRecommendations(params?: { timeRange?: number }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<any>(`/ai/recommendations${queryString ? `?${queryString}` : ""}`)
  }

  // Category management methods
  async getCategories(params?: { type?: 'expense' | 'income' | 'both'; active?: boolean }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<any>(`/categories${queryString ? `?${queryString}` : ""}`)
  }

  async createCategory(data: {
    name: string
    icon?: string
    color?: string
    type?: 'expense' | 'income' | 'both'
    description?: string
  }) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateCategory(id: string, data: {
    name?: string
    icon?: string
    color?: string
    type?: 'expense' | 'income' | 'both'
    description?: string
    isActive?: boolean
    order?: number
  }) {
    return this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteCategory(id: string) {
    return this.request<any>(`/categories/${id}`, {
      method: 'DELETE'
    })
  }

  async reorderCategories(categories: { id: string; order: number }[]) {
    return this.request<any>('/categories/reorder', {
      method: 'POST',
      body: JSON.stringify({ categories })
    })
  }

  async seedDefaultCategories() {
    return this.request<any>('/categories/seed', {
      method: 'POST'
    })
  }

  // Subscription management methods
  async getSubscriptions(params?: { status?: 'active' | 'paused' | 'cancelled'; sort?: 'amount' | 'name' | 'date' }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<any>(`/subscriptions${queryString ? `?${queryString}` : ""}`)
  }

  async getSubscription(id: string) {
    return this.request<any>(`/subscriptions/${id}`)
  }

  async createSubscription(data: {
    name: string
    description?: string
    amount: number
    currency?: string
    billingCycle?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
    startDate: string
    category?: string
    icon?: string
    color?: string
    reminderDays?: number
    website?: string
    notes?: string
    paymentMethod?: string
  }) {
    return this.request<any>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateSubscription(id: string, data: any) {
    return this.request<any>(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteSubscription(id: string) {
    return this.request<any>(`/subscriptions/${id}`, {
      method: 'DELETE'
    })
  }

  async processSubscriptionPayment(id: string, data?: { status?: 'paid' | 'pending' | 'failed'; createExpense?: boolean }) {
    return this.request<any>(`/subscriptions/${id}/payment`, {
      method: 'POST',
      body: JSON.stringify(data || {})
    })
  }

  async getUpcomingRenewals(days?: number) {
    const queryString = days ? this.buildQueryString({ days }) : ''
    return this.request<any>(`/subscriptions/upcoming${queryString ? `?${queryString}` : ""}`)
  }

  async getSubscriptionAnalytics() {
    return this.request<any>('/subscriptions/analytics')
  }

  // AI Insights methods
  async getSpendingInsights(params?: { timeRange?: number }) {
    const queryString = params ? this.buildQueryString(params) : ''
    return this.request<any>(`/insights/spending${queryString ? `?${queryString}` : ""}`)
  }

  async getBudgetRecommendationsAI() {
    return this.request<any>('/insights/budget-recommendations')
  }

  async getSavingsOpportunities() {
    return this.request<any>('/insights/savings-opportunities')
  }
}

export const api = new ApiClient(API_BASE_URL)
