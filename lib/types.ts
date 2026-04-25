export type Mode = "mock" | "real";

export type Verdict = "치명" | "위험" | "위태" | "생존";

export type Branch = "core" | "human" | "ai" | "meta";

export type Tier = 1 | 2 | 3;

export interface SkillNode {
  id: string;
  branch: Branch;
  tier: Tier;
  name: string;
  desc: string;
  urgency: number;
  unlocked?: boolean;
  parent?: string;
}

export interface Tool {
  name: string;
  category: string;
  why: string;
  urgency: number;
}

export interface PlaybookItem {
  when: "오늘" | "1주일" | "1개월" | "3개월";
  action: string;
}

export interface Stats {
  tech: number;
  human: number;
  creative: number;
  judgment: number;
}

export interface DiagnosisResult {
  percent: number;
  verdict: Verdict;
  tagline: string;
  role: string;
  stats: Stats;
  diagnosis: string[];
  skillTree: SkillNode[];
  tools: Tool[];
  playbook: PlaybookItem[];
  raw?: Record<string, unknown>;
  _fallback?: boolean;
  _error?: string;
}
