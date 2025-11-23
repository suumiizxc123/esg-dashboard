export type Level = "initial" | "development";

export type Domain = "Environment" | "Social" | "Governance" | "Education";

export interface IndicatorConfig {
  code: string;
  label: string;
  category: Domain;
  initialQuestion: string;
  developmentQuestion: string;
  weight: number;
  impact: number;
  description?: string;
}

export interface IndicatorOverride {
  weight?: number;
  impact?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "school";
  organization?: string;
  levelPreference?: Level;
  passwordHash: string;
}

export interface Assessment {
  id: string;
  userId: string;
  schoolName: string;
  level: Level;
  scores: Record<string, number>;
  createdAt: string;
}

export interface Database {
  users: User[];
  assessments: Assessment[];
  indicatorOverrides: Record<string, IndicatorOverride>;
}

export type PublicUser = Omit<User, "passwordHash">;

export interface Recommendation {
  indicatorCode: string;
  level: Level;
  title: string;
  actions: string[];
}
