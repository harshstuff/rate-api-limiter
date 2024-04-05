import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";
import { globalRateLimitConfig } from "./config/config";
import { isTokenValid } from "./authUtils";
import { RateLimitConfig } from "./interfaces/ratelimitconfig";
import { temporaryOverrides } from "./client/temporaryOverrides";


const redisClient = new Redis();

export function getRateLimitMiddleware(customConfig?: RateLimitConfig) {
  return async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // Check for temporary overrides based on date
    const currentDate = new Date();
    const currentOverride = temporaryOverrides.find((override) => {
      const start = new Date(override.startDate);
      const end = new Date(override.endDate);
      return currentDate >= start && currentDate <= end;
    });

    const config = currentOverride
      ? {
          windowMs: globalRateLimitConfig.windowMs, // Keep the window size consistent
          maxRequests: currentOverride.rateLimit,
        }
      : customConfig || globalRateLimitConfig;

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
      const requestTimestamps: number[] = await redisClient
        .lrange(key, 0, -1)
        .then((res) => res.map((ts) => parseInt(ts, 10)));
      const recentTimestamps = requestTimestamps.filter(
        (ts) => currentTime - ts < windowMs
      );

      if (recentTimestamps.length >= requestLimit) {
        res.setHeader("Retry-After", Math.ceil(windowMs / 1000));
        return res.status(429).send("Rate limit exceeded. Try again later.");
      }

      await redisClient.lpush(key, currentTime);
      await redisClient.ltrim(key, 0, requestLimit - 1);
      await redisClient.expire(key, windowMs / 1000);
    } catch (error) {
      console.error("Error interacting with Redis:", error);
      return res
        .status(503)
        .send("Service temporarily unavailable due to an internal error.");
    }

    next();
  };
}
