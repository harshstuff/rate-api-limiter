import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";
import { globalRateLimitConfig } from "./config/config";
import { isTokenValid } from "./authUtils";
import { RateLimitConfig } from "./interfaces/ratelimitconfig";

const redisClient = new Redis();

export function getRateLimitMiddleware(customConfig?: RateLimitConfig) {
  return async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const config: RateLimitConfig = customConfig || globalRateLimitConfig;
    const token = req.headers["x-auth-token"];
    const isAuthenticated = Boolean(token && isTokenValid(token.toString()));

    const { windowMs, maxRequests } = config;
    const requestLimit = isAuthenticated
      ? maxRequests.authenticated
      : maxRequests.unauthenticated;
    const keySuffix = isAuthenticated ? "authenticated" : "unauthenticated";
    const key = `rateLimit:${req.ip}:${keySuffix}`;
    const currentTime = Date.now();

    try {
      // Retrieve timestamps of previous requests from Redis
      const requestTimestamps: number[] = await redisClient
        .lrange(key, 0, -1)
        .then((res) => res.map((ts) => parseInt(ts, 10)));

      // Filter timestamps to those within the current rate limit window
      const recentTimestamps = requestTimestamps.filter(
        (ts) => currentTime - ts < windowMs
      );

      if (recentTimestamps.length >= requestLimit) {
        // When rate limit is exceeded, inform the client when they can try again
        res.setHeader("Retry-After", Math.ceil(windowMs / 1000)); // in seconds
        return res.status(429).send("Rate limit exceeded. Try again later.");
      }

      // Log the current request's timestamp in Redis and ensure the list doesn't exceed the max requests count
      await redisClient.lpush(key, currentTime);
      await redisClient.ltrim(key, 0, requestLimit - 1);
      await redisClient.expire(key, windowMs / 1000); // Set key expiration to match the rate limit window
    } catch (error) {
      console.error("Error interacting with Redis:", error);
      return res
        .status(503)
        .send("Service temporarily unavailable due to an internal error.");
    }

    next();
  };
}
