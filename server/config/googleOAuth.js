const { google } = require("googleapis")
const { DEFAULT_PROD_FRONTEND, getProdFrontendUrl, getProdFrontendOrigins } = require("./appUrls")

const DEFAULT_PROD_FRONTEND_URL = DEFAULT_PROD_FRONTEND

function normalizeOrigin(origin) {
  if (!origin || typeof origin !== "string") return ""
  return origin.trim().replace(/\/$/, "")
}

function getConfiguredFrontendUrl() {
  return getProdFrontendUrl()
}

function getAllowedFrontendOrigins() {
  return getProdFrontendOrigins()
}

function isAllowedOrigin(origin) {
  const normalized = normalizeOrigin(origin)
  return normalized && getAllowedFrontendOrigins().includes(normalized)
}

function resolveFrontendOrigin(req) {
  const queryOrigin = req.query?.origin || req.query?.redirectOrigin
  const headerOrigin = req.headers.origin
  const configured = getConfiguredFrontendUrl()

  // Never use a comma-separated FRONTEND_URL as redirect origin
  const candidate = normalizeOrigin(
    queryOrigin ||
      headerOrigin ||
      (configured && !configured.includes(",") ? configured : "") ||
      configured ||
      (process.env.NODE_ENV === "production" ? DEFAULT_PROD_FRONTEND_URL : "http://localhost:3000")
  )

  if (isAllowedOrigin(candidate)) {
    return candidate
  }

  if (configured && isAllowedOrigin(configured)) {
    return configured
  }

  if (process.env.NODE_ENV === "production" && isAllowedOrigin(DEFAULT_PROD_FRONTEND_URL)) {
    return DEFAULT_PROD_FRONTEND_URL
  }

  throw new Error(`Unauthorized frontend origin: ${candidate || "unknown"}`)
}

function parseOAuthState(state) {
  if (!state || typeof state !== "string") return null
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"))
    const origin = normalizeOrigin(parsed?.origin)
    return isAllowedOrigin(origin) ? origin : null
  } catch {
    return null
  }
}

function buildOAuthState(origin) {
  return Buffer.from(JSON.stringify({ origin: normalizeOrigin(origin) })).toString("base64url")
}

function getRedirectUri(origin) {
  return `${normalizeOrigin(origin)}/auth/google/callback`
}

function createOAuth2Client(redirectUri) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("Google OAuth credentials are not configured")
  }

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  )
}

function assertGoogleOAuthConfigured() {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set")
  }
}

module.exports = {
  DEFAULT_PROD_FRONTEND: DEFAULT_PROD_FRONTEND_URL,
  normalizeOrigin,
  getAllowedFrontendOrigins,
  getConfiguredFrontendUrl,
  isAllowedOrigin,
  resolveFrontendOrigin,
  parseOAuthState,
  buildOAuthState,
  getRedirectUri,
  createOAuth2Client,
  assertGoogleOAuthConfigured,
}
