import { Redis } from 'ioredis'

const redisGlobal = global as unknown as { redis: Redis }

export const redis =
  redisGlobal.redis ??
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

if (process.env.NODE_ENV !== 'production') redisGlobal.redis = redis
