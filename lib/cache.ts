import redis from "@/redis/redis";

// Cache helper: get from Redis or fetch from source
export async function getCached<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return (typeof cached === "string" ? JSON.parse(cached) : cached) as T;
    }
  } catch (error) {
    // Redis down — skip cache, fetch directly
    console.error("Redis cache read error:", error);
  }

  const data = await fetcher();

  try {
    await redis.set(key, JSON.stringify(data), { ex: ttlSeconds });
  } catch (error) {
    console.error("Redis cache write error:", error);
  }

  return data;
}

// Bust cache by key pattern
export async function bustCache(key: string) {
  try {
    await redis.del(key);
  } catch (error) {
    console.error("Redis cache bust error:", error);
  }
}

// Standard cache key builders
export const cacheKeys = {
  userProfile: (userId: string) => `cache:user:${userId}`,
  fileList: (userId: string) => `cache:files:${userId}`,
  fileContent: (userId: string, fileName: string) => `cache:file:${userId}:${fileName}`,
};
