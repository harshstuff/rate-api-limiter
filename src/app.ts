import express from "express";
import { getRateLimitMiddleware } from "./rateLimiter";

const app = express();

// Apply the rate limiting middleware globally
app.use(getRateLimitMiddleware());

app.get("/api/general", (req, res) => {
  res.send("Hello World");
});

// Special route that overrides the global rate limit and use customised values.
app.get(
  "/api/sensitive",
  getRateLimitMiddleware({
    windowMs: 10 * 1000, // 30 seconds
    maxRequests: { authenticated: 8, unauthenticated: 10 },
  }),
  (req, res) => {
    res.send("Sensitive data");
  }
);

app.listen(3000, () => console.log("Server running on port 3000"));



export default app;
