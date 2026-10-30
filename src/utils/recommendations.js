// Builds a custom stock watchlist based on quiz answers.
// Wanted to make the app seem intelligent at this part
// User's responses feel listened-to by the app and they can get a customised watchlist
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array

// Static stock dataset used for quiz recommendations
// Each stock includes symbol, name, tags (industries/style), and risk level
const UNIVERSE = [
  // Blue chip / stable
  { symbol: "MSFT", name: "Microsoft", tags: ["tech", "ai", "bluechip"], risk: "low" },
  { symbol: "AAPL", name: "Apple", tags: ["tech", "bluechip", "consumer"], risk: "low" },
  { symbol: "JNJ",  name: "Johnson & Johnson", tags: ["health", "bluechip"], risk: "low" },
  { symbol: "PG",   name: "Procter & Gamble", tags: ["consumer", "bluechip"], risk: "low" },
  { symbol: "JPM",  name: "JPMorgan Chase", tags: ["finance", "bluechip"], risk: "medium" },
  { symbol: "XOM",  name: "Exxon Mobil", tags: ["energy", "bluechip"], risk: "medium" },

  // Balanced / core growth
  { symbol: "GOOGL", name: "Alphabet", tags: ["tech", "ai"], risk: "medium" },
  { symbol: "AMZN",  name: "Amazon", tags: ["tech", "consumer", "ai"], risk: "medium" },
  { symbol: "V",     name: "Visa", tags: ["finance"], risk: "medium" },
  { symbol: "UNH",   name: "UnitedHealth", tags: ["health"], risk: "medium" },

  // Higher growth / higher risk
  { symbol: "NVDA", name: "NVIDIA", tags: ["tech", "ai", "growth"], risk: "high" },
  { symbol: "AMD",  name: "AMD", tags: ["tech", "ai", "growth"], risk: "high" },
  { symbol: "TSLA", name: "Tesla", tags: ["tech", "growth"], risk: "high" },
  { symbol: "PLTR", name: "Palantir", tags: ["ai", "growth"], risk: "high" },
];

// Calculates how closely a stock's risk matches the user's selected risk
function riskScore(stockRisk, quizRisk) {
  const order = { low: 0, medium: 1, high: 2, yolo: 3 };
  const s = order[stockRisk] ?? 1;
  const q = order[quizRisk] ?? 1;

  // Higher score if the risk levels are closer together
  return 3 - Math.min(Math.abs(s - q), 3);
}

// Main function that builds a recommended watchlist
export function buildWatchlistRecommendations(answers, count = 6) {
  const industries = answers?.industries ?? [];
  const style = answers?.style ?? "balanced";
  const quizRisk = answers?.risk ?? "medium";

  // Score each stock based on quiz answers
  const scored = UNIVERSE.map((s) => {
    let score = 0;

    // Add points if stock matches selected industries
    for (const tag of industries) {
      if (s.tags.includes(tag)) score += 3;
    }

    // Add points based on investment style preference
    if (style === "bluechip" && s.tags.includes("bluechip")) score += 4;
    if (style === "growth" && (s.tags.includes("growth") || s.risk === "high")) score += 4;
    if (style === "balanced" && (s.risk === "medium" || s.tags.includes("bluechip"))) score += 3;

    // Add points based on how close the risk level matches
    score += riskScore(s.risk, quizRisk);

    // Small bias towards safer stocks for new investors
    if (answers?.investorType === "new" && s.tags.includes("bluechip")) score += 2;

    return { ...s, score };
  })
  .sort((a, b) => b.score - a.score); // Sort highest score first

  // Ensure diversity: avoid too many stocks from the same industry
  const picked = [];
  const tagCount = new Map();

  for (const s of scored) {
    if (picked.length >= count) break;

    if (industries.length) {
      const mainTag = industries.find((t) => s.tags.includes(t));
      if (mainTag) {
        const n = tagCount.get(mainTag) ?? 0;
        if (n >= 2) continue;
        tagCount.set(mainTag, n + 1);
      }
    }

    picked.push(s);
  }

  // If not enough stocks selected, fill remaining slots from top results
  if (picked.length < count) {
    for (const s of scored) {
      if (picked.length >= count) break;
      if (picked.find((p) => p.symbol === s.symbol)) continue;
      picked.push(s);
    }
  }

  return picked.slice(0, count);
}