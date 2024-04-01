export interface RateLimitConfig {
  windowMs: number;
  maxRequests: {
    authenticated: number;
    unauthenticated: number;
  };
}
