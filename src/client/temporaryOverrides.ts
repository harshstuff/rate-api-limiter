import { OverrideConfig } from "../interfaces/overrideconfig";

export const temporaryOverrides: OverrideConfig[] = [
  {
    startDate: "2024-04-06T00:00:00Z",
    endDate: "2024-04-07T00:00:00Z",
    rateLimit: {
      authenticated: 3,
      unauthenticated: 2,
    },
  },
  // Add more overrides as needed
];