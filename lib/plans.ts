/**
 * CodeX SaaS Plan Configuration
 * 
 * This file serves as the single source of truth for all subscription tiers,
 * quotas, and feature flags. It is used by both the backend usage engine
 * and the frontend pricing UI.
 */

export type PlanType = "guest" | "free" | "pro";

/**
 * Defines the technical and business constraints for a subscription tier.
 */
export interface PlanLimits {
  aiMaxRequests: number;    // Daily AI assistant completions
  conversionLimit: number;   // Daily code-to-code conversions
  maxFiles: number;         // Maximum projects in user workspace
  maxStorageKB: number;     // Cloud storage allocation
  canExportCode: boolean;   // Permission to download projects
}

/**
 * The master mapping of all active plans.
 * To introduce a new tier (e.g., "enterprise"), simply add a new key here.
 */
export const PLAN_CONFIG: Record<PlanType, PlanLimits> = {
  guest: {
    aiMaxRequests: 2,
    conversionLimit: 2,
    maxFiles: 0,
    maxStorageKB: 0,
    canExportCode: false,
  },
  free: {
    aiMaxRequests: 10,
    conversionLimit: 5,
    maxFiles: 20,
    maxStorageKB: 1024, // 1MB
    canExportCode: true,
  },
  pro: {
    aiMaxRequests: 500,
    conversionLimit: 100,
    maxFiles: 1000,
    maxStorageKB: 102400, // 100MB
    canExportCode: true,
  },
};

/**
 * Helper utility to safely retrieve limits for a given plan name.
 * Defaults to the 'free' tier if the plan name is invalid or missing.
 */
export const getPlanLimits = (plan: string): PlanLimits => {
  const lowerPlan = (plan?.toLowerCase() || "free") as PlanType;
  return PLAN_CONFIG[lowerPlan] || PLAN_CONFIG.free;
};
