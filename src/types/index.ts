export interface StartupIdea {
  id: string;
  idea: string;
  timestamp: number;
}

export interface GeneratedContent {
  headline: string;
  pitch: string;
  cta: string;
  features: string[];
}

export interface SignupData {
  id: string;
  email: string;
  startupId: string;
  timestamp: number;
}

export interface Analytics {
  totalSignups: number;
  signupsByStartup: Record<string, number>;
  recentSignups: SignupData[];
}
