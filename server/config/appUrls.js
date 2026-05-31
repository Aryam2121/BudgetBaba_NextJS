/**
 * Production deployment URLs
 * Backend (API): https://budgetbaba-nextjs.onrender.com
 * Frontend (Next.js): set FRONTEND_URL on Render — typically https://budgetbaba.vercel.app
 */

const PROD_BACKEND_URL = "https://budgetbaba-nextjs.onrender.com"
const DEFAULT_PROD_FRONTEND = "https://budgetbaba.vercel.app"

function normalizeUrl(url) {
  if (!url || typeof url !== "string") return ""
  return url.trim().replace(/\/$/, "")
}

function getProdBackendUrl() {
  return normalizeUrl(process.env.BACKEND_URL) || PROD_BACKEND_URL
}

function getProdFrontendUrl() {
  return normalizeUrl(process.env.FRONTEND_URL) || DEFAULT_PROD_FRONTEND
}

module.exports = {
  PROD_BACKEND_URL,
  DEFAULT_PROD_FRONTEND,
  normalizeUrl,
  getProdBackendUrl,
  getProdFrontendUrl,
}
