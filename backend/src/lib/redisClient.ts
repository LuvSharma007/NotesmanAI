import { Redis } from "ioredis";
import type { RedisOptions } from "ioredis";

export const redisConfig: RedisOptions = {
    host: process.env.REDIS_HOST || "redis-stack",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null
}

export const redisClient = new Redis(redisConfig)
