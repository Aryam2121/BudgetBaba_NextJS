/**
 * Production deployment URLs
 * Backend (API): https://budgetbaba-nextjs.onrender.com
 * Frontend (Next.js): https://budgetbaba.vercel.app
 */

const PROD_BACKEND_URL = "https://budgetbaba-nextjs.onrender.com"
const DEFAULT_PROD_FRONTEND = "https://budgetbaba.vercel.app"

function normalizeUrl(url) {
  if (!url || typeof url !== "string") return ""
  return url.trim().replace(/\/$/, "")
}

/** Split FRONTEND_URL — supports accidental comma-separated values on Render */
function parseFrontendUrlList(raw) {
  if (!raw || typeof raw !== "string") return []
  return raw
    .split(",")
    .map(normalizeUrl)
    .filter(Boolean)
}

function pickPrimaryFrontendUrl(urls) {
  if (!urls.length) return DEFAULT_PROD_FRONTEND

  const httpsProd = urls.find(
    (url) => url.startsWith("https://") && !url.includes("localhost") && !url.includes("127.0.0.1")
  )
  if (httpsProd) return httpsProd

  const anyHttps = urls.find((url) => url.startsWith("https://"))
  if (anyHttps) return anyHttps

  return urls[0]
}

function getProdBackendUrl() {
  return normalizeUrl(process.env.BACKEND_URL) || PROD_BACKEND_URL
}

/** Single canonical frontend URL for OAuth redirect_uri */
function getProdFrontendUrl() {
  const fromEnv = parseFrontendUrlList(process.env.FRONTEND_URL)
  if (fromEnv.length) return pickPrimaryFrontendUrl(fromEnv)
  return DEFAULT_PROD_FRONTEND
}

/** All frontend origins to allow (CORS + OAuth) */
function getProdFrontendOrigins() {
  const origins = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    DEFAULT_PROD_FRONTEND,
  ])

  parseFrontendUrlList(process.env.FRONTEND_URL).forEach((url) => origins.add(url))
  parseFrontendUrlList(process.env.ALLOWED_FRONTEND_ORIGINS).forEach((url) => origins.add(url))

  return [...origins]
}

module.exports = {
  PROD_BACKEND_URL,
  DEFAULT_PROD_FRONTEND,
  normalizeUrl,
  parseFrontendUrlList,
  pickPrimaryFrontendUrl,
  getProdBackendUrl,
  getProdFrontendUrl,
  getProdFrontendOrigins,
}
