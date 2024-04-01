import { BaseRateLimit } from "./baseratelimit";
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: BaseRateLimit;
}
