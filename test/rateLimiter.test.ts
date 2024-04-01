import app from "../src/app";
import request, { Response } from "supertest";


test("Rate limit check on a global endpoint for authenticated users", async () => {
  const endpoint = "/api/general";
  let response;
  // Simulate authenticated requests by including an 'x-auth-token' header
  for (let i = 0; i < 21; i++) {
    response = await request(app)
      .get(endpoint)
      .set("x-auth-token", "nonemptyvalue");
      if (i < 20) {
      expect(response.statusCode).toBe(200);
    }
  }
  expect(response!.statusCode).toBe(429); // Expect to hit the rate limit
});
