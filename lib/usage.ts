import redis from "@/redis/redis";
import UserLimitModel from "@/models/User_limit";
import UserModel from "@/models/UserModel";
import { ConnectoDatabase } from "@/lib/db";
import { PLAN_CONFIG } from "./plans";

export type UsageAction = "ai" | "conversion";

const CACHE_TTL = 86400; // 24 hours in seconds

/**
 * Validates if the user (or guest) has remaining credits for a specific action.
 * Synchronizes Redis cache with MongoDB ground truth and handles plan expiration.
 * 
 * @param userId - The unique identifier of the authenticated user, or null for guests.
 * @param type - The action category ("ai" or "conversion").
 * @param ip - The client's IP address (primarily for guest tracking).
 * @returns { allowed: boolean, message?: string, remaining: number }
 */
export async function checkUsage(userId: string | null, type: UsageAction, ip?: string) {
  // --- Guest Context (IP-based Redis tracking) ---
  if (!userId) {
    const guestKey = `usage:guest:${ip || 'unknown'}:${type}`;
    const count = await redis.get(guestKey);
    const planLimits = PLAN_CONFIG.guest;
    const limit = type === "ai" ? planLimits.aiMaxRequests : planLimits.conversionLimit;
    
    const currentCount = parseInt(count as string) || 0;
    if (currentCount >= limit) {
      return { 
        allowed: false, 
        message: type === "ai" 
          ? "Guest daily AI limit reached. Sign in for more!" 
          : "Guest daily conversion limit reached. Sign in for more!", 
        remaining: 0 
      };
    }
    return { allowed: true, remaining: limit - currentCount };
  }

  // --- Authenticated User Context (Redis Cache + MongoDB Sync) ---
  const cacheKey = `usage:user:${userId}:${type}`;
  
  try {
    // 1. High-Performance Cache Lookup
    const cachedRemaining = await redis.get(cacheKey);
    if (cachedRemaining !== null) {
      const remaining = parseInt(cachedRemaining as string);
      if (remaining <= 0) {
        return { 
          allowed: false, 
          message: `Daily ${type.toUpperCase()} limit reached. Upgrade for more!`, 
          remaining: 0 
        };
      }
      return { allowed: true, remaining };
    }

    // 2. Database Synchronization & Plan Validation
    await ConnectoDatabase();
    const [user, userLimitDoc] = await Promise.all([
      UserModel.findById(userId),
      UserLimitModel.findOne({ userId })
    ]);

    let plan = user?.plan || "free";
    const now = new Date();

    // Revert to 'free' plan if the current plan has expired
    if (plan !== "free" && user?.planExpiryDate && now > user.planExpiryDate) {
      plan = "free";
      await UserModel.findByIdAndUpdate(userId, { plan: "free", planExpiryDate: null });
    }

    const planLimits = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;
    let userLimit = userLimitDoc;

    // Initialize usage tracking record if it doesn't exist (Atomically)
    if (!userLimit) {
      const updatedLimit = await UserLimitModel.findOneAndUpdate(
        { userId },
        { 
          $setOnInsert: { 
            aiMaxRequests: planLimits.aiMaxRequests,
            conversionLimit: planLimits.conversionLimit,
            aiResetAt: new Date(Date.now() + 86400000), // Next 24h cycle
            conversionResetAt: new Date(Date.now() + 86400000)
          } 
        },
        { upsert: true, new: true }
      );
      if (!updatedLimit) throw new Error("Critical: Failed to sync user usage record.");
      userLimit = updatedLimit;
    }

    // --- Reset Cycle Logic ---
    const resetField = type === "ai" ? "aiResetAt" : "conversionResetAt";
    const countField = type === "ai" ? "aiRequestCount" : "conversionCount";
    const maxLimit = type === 'ai' ? planLimits.aiMaxRequests : planLimits.conversionLimit;

    // Reset consumption count if the current cycle has passed
    if (userLimit && now > (userLimit[resetField] as Date)) {
      userLimit[countField] = 0;
      userLimit[resetField] = new Date(Date.now() + 86400000);
      await userLimit.save();
    }

    const remaining = maxLimit - (userLimit[countField] as number);

    // Refresh Redis cache with synchronized data
    await redis.set(cacheKey, remaining.toString(), { ex: CACHE_TTL });
    
    if (remaining <= 0) {
      return { 
        allowed: false, 
        message: `Daily ${type.toUpperCase()} limit reached. Upgrade for more!`, 
        remaining: 0 
      };
    }
    return { allowed: true, remaining };
  } catch (error) {
    console.error(`[Usage Engine] Check failed for ${userId} (${type}):`, error);
    return { allowed: true, remaining: 1 }; // Fail-open to preserve User Experience
  }
}

/**
 * Records the consumption of a credit for a given user or guest.
 * Atomically decrements the Redis cache and increments the MongoDB counter.
 * 
 * @param userId - Use null for guests.
 * @param type - The action consumed.
 * @param ip - Client IP (optional, fallback for guests).
 */
export async function recordUsage(userId: string | null, type: UsageAction, ip?: string) {
  try {
    if (!userId) {
      const guestKey = `usage:guest:${ip || 'unknown'}:${type}`;
      await redis.incr(guestKey);
      await redis.expire(guestKey, CACHE_TTL);
      return;
    }

    const cacheKey = `usage:user:${userId}:${type}`;
    const dbUpdate = type === "ai" 
      ? { aiRequestCount: 1 } 
      : { conversionCount: 1 };

    // Batch updates to both storage layers for atomic performance
    await Promise.all([
      redis.decr(cacheKey),
      ConnectoDatabase().then(() => 
        UserLimitModel.findOneAndUpdate({ userId }, { $inc: dbUpdate })
      )
    ]);
  } catch (error) {
    console.error(`[Usage Engine] Record failed for ${userId}:`, error);
  }
}
