import { Request, Response, NextFunction } from "express";
import Redis from "ioredis";
import { globalRateLimitConfig } from "./config/config";
import { isTokenValid } from "./authUtils";

const redisClient = new Redis();

export function getRateLimitMiddleware(customConfig?: {
  windowMs: number;
  maxRequests: { authenticated: number; unauthenticated: number };
}) {
  return async function rateLimitMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { windowMs, maxRequests } = customConfig || globalRateLimitConfig;
    const token = req.headers["x-auth-token"];
    const isAuthenticated = token && isTokenValid(token.toString());
    const requestLimit = isAuthenticated
      ? maxRequests.authenticated
      : maxRequests.unauthenticated;
    const keySuffix = isAuthenticated ? "authenticated" : "unauthenticated";
    const key = `rateLimit:${req.ip}:${keySuffix}`;
    const currentTime = Date.now();
    const requestTimestamps: number[] = await redisClient
      .lrange(key, 0, -1)
      .then((res) => res.map((ts) => parseInt(ts, 10)));
    const recentTimestamps = requestTimestamps.filter(
      (ts) => currentTime - ts < windowMs
    );

    if (recentTimestamps.length >= requestLimit) {
      return res.status(429).send("Rate limit exceeded. Try again later.");
    }

    await redisClient.lpush(key, currentTime);
    await redisClient.ltrim(key, 0, requestLimit - 1);
    await redisClient.expire(key, windowMs / 1000);

    next();
  };
}
