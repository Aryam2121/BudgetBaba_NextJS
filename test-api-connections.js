// Simple script to test API connections
const API_BASE_URL = "http://localhost:5000/api";

// Test endpoints without authentication
const testEndpoints = [
  { name: "Health Check", url: "/health", method: "GET", needsAuth: false },
];

// Test endpoints that need authentication (these will return 401 without token)
const authEndpoints = [
  { name: "Get Expenses", url: "/expenses", method: "GET", needsAuth: true },
  { name: "Get Budgets", url: "/budgets", method: "GET", needsAuth: true },
  { name: "Get Goals", url: "/goals", method: "GET", needsAuth: true },
  { name: "Get Notifications", url: "/notifications", method: "GET", needsAuth: true },
  { name: "Get Recurring", url: "/recurring", method: "GET", needsAuth: true },
  { name: "Get Splits", url: "/splits", method: "GET", needsAuth: true },
  { name: "Analytics - Trends", url: "/analytics/trends", method: "GET", needsAuth: true },
  { name: "Analytics - Categories", url: "/analytics/categories", method: "GET", needsAuth: true },
  { name: "Analytics - Insights", url: "/analytics/insights", method: "GET", needsAuth: true },
  { name: "Export History", url: "/exports/history", method: "GET", needsAuth: true },
];

async function testAPI() {
  console.log("🔍 Testing API Connections...\n");
  
  // Import fetch for older Node.js versions
  let fetch;
  try {
    fetch = globalThis.fetch;
  } catch {
    try {
      fetch = require('node-fetch');
    } catch {
      console.log("❌ fetch not available. Install node-fetch or use Node.js 18+");
      return;
    }
  }
  
  // Test public endpoints
  for (const endpoint of testEndpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.url}`);
      const status = response.status;
      const statusText = response.ok ? "✅ OK" : "❌ FAILED";
      console.log(`${statusText} ${endpoint.name}: ${status}`);
    } catch (error) {
      console.log(`❌ FAILED ${endpoint.name}: ${error.message}`);
    }
  }
  
  console.log("\n🔐 Testing Protected Endpoints (should return 401)...\n");
  
  // Test protected endpoints (should return 401)
  for (const endpoint of authEndpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint.url}`);
      const status = response.status;
      const statusText = status === 401 ? "✅ PROTECTED" : (status === 200 ? "⚠️  ACCESSIBLE" : "❌ ERROR");
      console.log(`${statusText} ${endpoint.name}: ${status}`);
    } catch (error) {
      console.log(`❌ FAILED ${endpoint.name}: ${error.message}`);
    }
  }
  
  console.log("\n✨ API Connection Test Complete!");
}

// Run the test if this script is executed directly
if (typeof window === 'undefined' && require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI };