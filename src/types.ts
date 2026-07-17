export type FrameworkType = 'pros_cons' | 'comparison' | 'swot';

export interface DecisionInput {
  title: string; // The core dilemma, e.g. "Should I move to Seattle?"
  framework: FrameworkType;
  options: string[]; // Options being considered (at least one, e.g., ["Stay in SF", "Move to Seattle"])
  context?: string; // Any extra context (e.g., budget, timeline, preferences)
  criteria?: string[]; // Custom criteria for comparison, if any
}

// Pros & Cons
export interface ProConPoint {
  point: string;
  impact: 'high' | 'medium' | 'low';
  explanation: string;
}

export interface OptionProCon {
  optionName: string;
  pros: ProConPoint[];
  cons: ProConPoint[];
  score: number; // 0-100 calculated balance score
}

export interface ProsConsAnalysis {
  summary: string;
  recommendation: string;
  options: OptionProCon[];
}

// Comparison
export interface ComparisonRating {
  score: number; // 1 to 5
  text: string;  // Short comment explaining the rating
}

export interface ComparisonOption {
  name: string;
  ratings: Record<string, ComparisonRating>; // key is criterion name
  overallScore: number; // calculated average rating (1-5)
  verdict: string; // concise summary of why this option fits/doesn't fit
}

export interface ComparisonAnalysis {
  summary: string;
  recommendation: string;
  criteria: string[];
  options: ComparisonOption[];
}

// SWOT Analysis
export interface SwotItem {
  title: string;
  description: string;
}

export interface SwotAnalysis {
  summary: string;
  recommendation: string;
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
}

// Unified decision payload returned by API
export interface DecisionResponse {
  id: string;
  input: DecisionInput;
  timestamp: string;
  framework: FrameworkType;
  
  // Exactly one of these will be populated depending on the selected framework
  prosCons?: ProsConsAnalysis;
  comparison?: ComparisonAnalysis;
  swot?: SwotAnalysis;
}

export interface SavedDecision {
  id: string;
  title: string;
  timestamp: string;
  framework: FrameworkType;
  input: DecisionInput;
  response: DecisionResponse;
  rating?: number; // 1-5 stars if user rated the decision helper
}
