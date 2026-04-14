import Redis from "ioredis";

const redisClient = () => {
  if (process.env.REDIS_URL) {
    return new Redis(process.env.REDIS_URL);
  }
  return null;
};

export const redis = (globalThis as any).redis || redisClient();

if (process.env.NODE_ENV !== "production") (globalThis as any).redis = redis;
