export interface StartupIdea {
  id: string;
  idea: string;
  timestamp: number;
  source?: string; // UTM source tracking
  industry?: string; // Auto-detected industry
}

export interface GeneratedContent {
  headline: string;
  pitch: string;
  cta: string;
  features: string[];
  industry: string;
}

export interface SignupData {
  id: string;
  email: string;
  startupId: string;
  timestamp: number;
  source?: string; // UTM source tracking
  wouldPay: boolean; // Intent to pay
  pricePoint?: number; // Price point they selected (0, 9, 19, 29)
}

export interface CustomerFeedback {
  id: string;
  startupId: string;
  feedback: string;
  rating: number; // 1-5 stars
  timestamp: number;
  source?: string;
}

export interface Analytics {
  totalSignups: number;
  signupsByStartup: Record<string, number>;
  recentSignups: SignupData[];
  totalLandingPages: number;
  wouldPaySignals: number;
  signupsBySource: Record<string, number>;
  topStartups: Array<{
    id: string;
    idea: string;
    signupCount: number;
  }>;
}

// Validation metrics for hackathon
export interface ValidationMetrics {
  landingPagesGenerated: number;
  emailsCaptured: number;
  wouldPaySignals: number;
  signupsBySource: Record<string, number>;
  topStartups: Array<{
    id: string;
    idea: string;
    signupCount: number;
    wouldPayCount: number;
  }>;
  recentQuotes: string[]; // Customer quotes for presentation
}
