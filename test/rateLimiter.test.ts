import app from "../src/app";
import request, { Response } from "supertest";
import { temporaryOverrides } from "../src/client/temporaryOverrides";


const isTodaySpecialEvent = (): boolean => {
  const today = new Date();
  return temporaryOverrides.some(
    (event) =>
      today >= new Date(event.startDate) && today <= new Date(event.endDate)
  );
};


test("Rate limit check with consideration for special event overrides", async () => {
  const endpoint = "/api/general";
  let response;
  const limitForToday = isTodaySpecialEvent() ? 3 : 20; // 3 for special events, 20 otherwise
  console.log(limitForToday, isTodaySpecialEvent());

  // Simulate requests by including an 'x-auth-token' header
  for (let i = 0; i <= limitForToday; i++) {
    response = await request(app)
      .get(endpoint)
      .set("x-auth-token", "nonemptyvalue");

    if (i < limitForToday) {
      expect(response.statusCode).toBe(200); // Requests within limit should succeed
    } else {
      expect(response.statusCode).toBe(429); // The request exceeding the limit should be rate limited
    }
  }
});
