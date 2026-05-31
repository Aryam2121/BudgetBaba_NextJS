import { api } from "@/lib/api"

/** Normalize API list responses — backend uses named keys, not always `.data` */
export function getExpensesList(data: unknown): any[] {
  if (!data) return []
  if (Array.isArray(data)) return data
  const obj = data as Record<string, unknown>
  if (Array.isArray(obj.expenses)) return obj.expenses
  if (Array.isArray(obj.data)) return obj.data
  return []
}

export function getListFromResponse<T = any>(
  data: unknown,
  keys: string[] = []
): T[] {
  if (!data) return []
  if (Array.isArray(data)) return data as T[]
  const obj = data as Record<string, unknown>
  for (const key of keys) {
    if (Array.isArray(obj[key])) return obj[key] as T[]
  }
  if (Array.isArray(obj.data)) return obj.data as T[]
  return []
}

export function getSplitsList(data: unknown): any[] {
  return getListFromResponse(data, ["splits"])
}

export function getExpenseTotal(data: unknown): number {
  if (!data || typeof data !== "object") return 0
  const total = (data as Record<string, unknown>).total
  return typeof total === "number" ? total : getExpensesList(data).length
}

/** Fetch all expense pages for reports/exports */
export async function fetchAllExpenses(filters?: {
  from?: string
  to?: string
  category?: string
}): Promise<any[]> {
  const limit = 500
  let page = 1
  let all: any[] = []
  let total = Infinity

  while (all.length < total) {
    const response = await api.getExpenses({ ...filters, page, limit })
    if (response.error) {
      throw new Error(response.error)
    }

    const batch = getExpensesList(response.data)
    total = getExpenseTotal(response.data)

    if (batch.length === 0) break

    all = all.concat(batch)
    if (batch.length < limit) break
    page += 1
  }

  return all
}
