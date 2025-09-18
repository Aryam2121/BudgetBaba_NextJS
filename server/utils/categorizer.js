// Enhanced auto-categorization logic with more comprehensive mappings
const categoryMappings = {
  Food: [
    // Food delivery & restaurants
    "zomato",
    "swiggy",
    "uber eats",
    "foodpanda",
    "dominos",
    "pizza hut",
    "mcdonalds",
    "kfc",
    "subway",
    "burger king",
    "starbucks",
    "cafe coffee day",
    "restaurant",
    "cafe",
    "food",
    "meal",
    "lunch",
    "dinner",
    "breakfast",
    "dining",
    "eatery",
    "bistro",
    "bakery",
    "ice cream",
    // Groceries
    "grocery",
    "supermarket",
    "big bazaar",
    "reliance fresh",
    "dmart",
    "more megastore",
    "spencer",
    "food bazaar",
    "nature basket",
    "vegetables",
    "fruits",
    "milk",
    "bread",
    "rice",
    "dal",
  ],
  Transport: [
    // Ride sharing & taxis
    "uber",
    "ola",
    "rapido",
    "auto",
    "taxi",
    "cab",
    "rickshaw",
    // Public transport
    "bus",
    "metro",
    "train",
    "railway",
    "irctc",
    "bmtc",
    "best",
    // Fuel & vehicle
    "petrol",
    "diesel",
    "fuel",
    "gas station",
    "hp",
    "ioc",
    "bpcl",
    "parking",
    "toll",
    "transport",
    "vehicle",
    "car wash",
  ],
  Shopping: [
    // E-commerce
    "amazon",
    "flipkart",
    "myntra",
    "ajio",
    "nykaa",
    "meesho",
    "snapdeal",
    "paytm mall",
    "tata cliq",
    "shoppers stop",
    "lifestyle",
    // Categories
    "shopping",
    "mall",
    "clothes",
    "clothing",
    "fashion",
    "shoes",
    "footwear",
    "electronics",
    "mobile",
    "phone",
    "laptop",
    "computer",
    "gadget",
    "books",
    "stationery",
    "cosmetics",
    "jewelry",
    "accessories",
  ],
  Entertainment: [
    // Streaming services
    "netflix",
    "amazon prime",
    "hotstar",
    "zee5",
    "sony liv",
    "voot",
    "spotify",
    "youtube premium",
    "apple music",
    "gaana",
    "jio saavn",
    // Entertainment venues
    "movie",
    "cinema",
    "theatre",
    "multiplex",
    "pvr",
    "inox",
    "carnival",
    "game",
    "gaming",
    "entertainment",
    "subscription",
    "concert",
    "show",
  ],
  Bills: [
    // Utilities
    "electricity",
    "power",
    "bescom",
    "mseb",
    "kseb",
    "tneb",
    "water",
    "bwssb",
    "water bill",
    "gas",
    "lpg",
    "indane",
    "bharat gas",
    "hp gas",
    // Telecom
    "internet",
    "broadband",
    "wifi",
    "airtel",
    "jio",
    "vi",
    "bsnl",
    "mobile bill",
    "recharge",
    "postpaid",
    "prepaid",
    // Other bills
    "utility",
    "bill",
    "payment",
    "maintenance",
    "society",
  ],
  Healthcare: [
    "hospital",
    "clinic",
    "doctor",
    "physician",
    "dentist",
    "dental",
    "medicine",
    "pharmacy",
    "medical",
    "health",
    "treatment",
    "apollo",
    "fortis",
    "max",
    "manipal",
    "narayana",
    "medanta",
    "insurance",
    "health insurance",
    "medical insurance",
    "lab test",
    "pathology",
    "diagnostic",
    "checkup",
    "consultation",
  ],
  Education: [
    "school",
    "college",
    "university",
    "institute",
    "academy",
    "course",
    "class",
    "tuition",
    "coaching",
    "training",
    "book",
    "books",
    "education",
    "learning",
    "study",
    "fees",
    "admission",
    "exam",
    "certification",
    "workshop",
  ],
}

function categorizeExpense(vendor = "", note = "") {
  const text = `${vendor} ${note}`.toLowerCase().trim()

  // Return 'Other' if no text to analyze
  if (!text) return "Other"

  // Score each category based on keyword matches
  const categoryScores = {}

  for (const [category, keywords] of Object.entries(categoryMappings)) {
    let score = 0

    for (const keyword of keywords) {
      // Exact match gets higher score
      if (text === keyword) {
        score += 10
      }
      // Word boundary match
      else if (text.includes(` ${keyword} `) || text.startsWith(`${keyword} `) || text.endsWith(` ${keyword}`)) {
        score += 5
      }
      // Partial match
      else if (text.includes(keyword)) {
        score += 2
      }
    }

    if (score > 0) {
      categoryScores[category] = score
    }
  }

  // Return category with highest score
  if (Object.keys(categoryScores).length > 0) {
    return Object.keys(categoryScores).reduce((a, b) => (categoryScores[a] > categoryScores[b] ? a : b))
  }

  return "Other"
}

function addCustomMapping(category, keywords) {
  if (!categoryMappings[category]) {
    categoryMappings[category] = []
  }
  categoryMappings[category].push(...keywords)
}

// Get category suggestions based on partial text
function getCategorySuggestions(text = "") {
  const suggestions = []
  const lowerText = text.toLowerCase()

  for (const [category, keywords] of Object.entries(categoryMappings)) {
    const matchingKeywords = keywords.filter((keyword) => keyword.includes(lowerText) || lowerText.includes(keyword))

    if (matchingKeywords.length > 0) {
      suggestions.push({
        category,
        confidence: matchingKeywords.length,
        matchedKeywords: matchingKeywords.slice(0, 3), // Top 3 matches
      })
    }
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

module.exports = {
  categorizeExpense,
  addCustomMapping,
  getCategorySuggestions,
  categoryMappings,
}
