
export const globalRateLimitConfig = {
  windowMs: 60  * 1000, // 1 minute in milliseconds
  maxRequests: {
    unauthenticated: 10,
    authenticated: 20,
  },
};

/* Used small numbers (params) for quick testing. Could be scaled to large if required */