export type RiskLevel = "critical" | "high" | "medium" | "low" | "none";

export interface RiskResult {
  level: RiskLevel;
  category: string | null;
  matchedKeywords: string[];
}

const RISK_PATTERNS: {
  level: RiskLevel;
  category: string;
  keywords: string[];
}[] = [
  {
    level: "critical",
    category: "suicidal",
    keywords: [
      "хочу умереть",
      "не хочу жить",
      "покончить с собой",
      "суицид",
      "убить себя",
      "жить не хочу",
      "лучше бы меня не было",
      "не вижу смысла жить",
      "хочу всё закончить",
      "прощайте",
      "прощай навсегда",
    ],
  },
  {
    level: "critical",
    category: "self_harm",
    keywords: [
      "порезать себя",
      "причинить себе боль",
      "самоповреждение",
      "режу себя",
    ],
  },
  {
    level: "high",
    category: "severe_distress",
    keywords: [
      "невыносимо",
      "больше не могу",
      "сил нет",
      "всё бессмысленно",
      "никому не нужен",
      "никому не нужна",
      "хочу исчезнуть",
      "устал жить",
      "устала жить",
      "нет выхода",
    ],
  },
  {
    level: "medium",
    category: "emotional_crisis",
    keywords: [
      "очень плохо",
      "депрессия",
      "паника",
      "тревога",
      "не сплю",
      "не могу есть",
      "плачу каждый день",
      "ничего не радует",
      "всё раздражает",
    ],
  },
];

export function classifyRisk(text: string): RiskResult {
  const lowerText = text.toLowerCase();
  const matched: { level: RiskLevel; category: string; keyword: string }[] = [];

  for (const pattern of RISK_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matched.push({
          level: pattern.level,
          category: pattern.category,
          keyword,
        });
      }
    }
  }

  if (matched.length === 0) {
    return { level: "none", category: null, matchedKeywords: [] };
  }

  // Берём наивысший уровень риска из найденных
  const priority: RiskLevel[] = ["critical", "high", "medium", "low", "none"];
  const topLevel = priority.find((lvl) => matched.some((m) => m.level === lvl)) || "none";
  const topMatch = matched.find((m) => m.level === topLevel)!;

  return {
    level: topLevel,
    category: topMatch.category,
    matchedKeywords: matched.map((m) => m.keyword),
  };
}