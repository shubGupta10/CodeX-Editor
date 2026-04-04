import redis from "@/redis/redis";


const LIMIT = 5; 
const WINDOW = 60; 

const AI_LIMIT = 10; 
const AI_WINDOW = 3600; 

export async function rateLimit(ip: string) {
  try {
    const key = `rate-limit:${ip}`;

    const requestCount = await redis.incr(key);

    if (requestCount === 1) {
      await redis.expire(key, WINDOW);
    }

    if (requestCount > LIMIT) {
      return { success: false, message: "Too many requests, please wait...", remaining: 0 };
    }

    return { success: true, remaining: LIMIT - requestCount };
  } catch (error) {
    // If Redis is down, allow the request (fail-open) rather than blocking users
    console.error("Rate limiter error (Redis may be down):", error);
    return { success: true, remaining: LIMIT };
  }
}


export async function aiRateLimit(userId: string) {
  try {
    const key = `ai-limit:${userId}`; 
    const requestCount = await redis.incr(key);

    if (requestCount === 1) {
      await redis.expire(key, AI_WINDOW); 
    }

    const timeLeft = await redis.ttl(key);

    if (requestCount > AI_LIMIT) {
      return {
        success: false,
        message: `Daily AI limit reached. Try again in ${timeLeft} seconds.`,
      };
    }

    return {
      success: true,
      remaining: AI_LIMIT - requestCount,
      resetIn: timeLeft,
    };
  } catch (error) {
    console.error("AI rate limiter error (Redis may be down):", error);
    return { success: true, remaining: AI_LIMIT, resetIn: AI_WINDOW };
  }
}

export async function checkGuestExecution(ip: string) {
  try {
    const key = `guest-execute:${ip}`;
    const count = await redis.get(key);
    
    if (count && parseInt(count as string) >= 1) {
      return { success: false, message: "Guest limit reached. Sign in for more!" };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Guest execution limit error:", error);
    return { success: true }; // Fail-open
  }
}

export async function incrementGuestExecution(ip: string) {
  try {
    const key = `guest-execute:${ip}`;
    await redis.set(key, "1", { ex: 24 * 3600 }); // 24 hour lockout
  } catch (error) {
    console.error("Increment guest execution error:", error);
  }
}
