const { categorizeExpense, getCategorySuggestions } = require("../server/utils/categorizer")

// Test cases for auto-categorization
const testCases = [
  { vendor: "Zomato", note: "Lunch order", expected: "Food" },
  { vendor: "Uber", note: "Ride to office", expected: "Transport" },
  { vendor: "Amazon", note: "Mobile phone purchase", expected: "Shopping" },
  { vendor: "Netflix", note: "Monthly subscription", expected: "Entertainment" },
  { vendor: "BESCOM", note: "Electricity bill", expected: "Bills" },
  { vendor: "Apollo Hospital", note: "Doctor consultation", expected: "Healthcare" },
  { vendor: "Byju's", note: "Course fees", expected: "Education" },
  { vendor: "Random Store", note: "Some purchase", expected: "Other" },
]

console.log("🧪 Testing Auto-Categorization Logic\n")

testCases.forEach((test, index) => {
  const result = categorizeExpense(test.vendor, test.note)
  const status = result === test.expected ? "✅" : "❌"

  console.log(`${index + 1}. ${status} "${test.vendor}" + "${test.note}"`)
  console.log(`   Expected: ${test.expected}, Got: ${result}`)

  if (result !== test.expected) {
    const suggestions = getCategorySuggestions(`${test.vendor} ${test.note}`)
    console.log(`   Suggestions:`, suggestions.slice(0, 2))
  }
  console.log("")
})

console.log("🔍 Testing Category Suggestions\n")

const suggestionTests = ["food", "uber", "amazon", "netflix"]
suggestionTests.forEach((text) => {
  const suggestions = getCategorySuggestions(text)
  console.log(`"${text}" suggestions:`, suggestions.slice(0, 3))
})
