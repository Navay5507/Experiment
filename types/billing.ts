import type { Plan } from "./database";

export type { Plan };

export interface PlanLimits {
  maxActiveAutomations: number;
  hasFollowGate: boolean;
  hasLeadCapture: boolean;
  hasStoryAutomation: boolean;
  hasRetrigger: boolean;
  hasAiChat: boolean;
  rateLimitConfigurable: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxActiveAutomations: 1,
    hasFollowGate: false,
    hasLeadCapture: false,
    hasStoryAutomation: false,
    hasRetrigger: false,
    hasAiChat: false,
    rateLimitConfigurable: false,
  },
  pro: {
    maxActiveAutomations: Infinity,
    hasFollowGate: true,
    hasLeadCapture: true,
    hasStoryAutomation: true,
    hasRetrigger: true,
    hasAiChat: false,
    rateLimitConfigurable: true,
  },
  elite: {
    maxActiveAutomations: Infinity,
    hasFollowGate: true,
    hasLeadCapture: true,
    hasStoryAutomation: true,
    hasRetrigger: true,
    hasAiChat: true,
    rateLimitConfigurable: true,
  },
};

export interface SubscriptionStatus {
  plan: Plan;
  trialEndsAt: string | null;
  isTrialActive: boolean;
}
