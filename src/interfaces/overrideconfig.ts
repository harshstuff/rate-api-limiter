/*
Allow temporary rate limit overrides based on specific criteria. 
Assuming a time period for a certain period is a campaign day and more request is anticipated. 
We apply override for that certain timeframe.
 */
export interface OverrideConfig {
  startDate: string; // ISO 8601 format
  endDate: string;
  rateLimit: {
    authenticated: number;
    unauthenticated: number;
  };
}
