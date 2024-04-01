# Rate Limiter Middleware for Express.js

This project implements a flexible rate limiting middleware for Express.js applications, using TypeScript and Redis. It's designed to help protect your API from excessive use and to ensure that your service remains available and responsive.

## Project Description

The rate limiting middleware allows for both global and endpoint-specific request rate limits within your Express.js application. It supports different rate limits for authenticated and unauthenticated users, providing a balance between protecting your resources and offering a fair usage policy.

## Features

- **Global Rate Limit**: Apply a default rate limit to all routes within your application.
- **Custom Rate Limits**: Override global settings for specific endpoints as needed.
- **Authentication Awareness**: Differentiate between authenticated and unauthenticated requests, applying appropriate limits.
- **Sliding Log Algorithm**: Uses a *sliding window algorithm* for more granular control over request rates.
- **Redis Integration**: Leverages Redis for efficient tracking of request counts and timestamps.

## Getting Started

### Prerequisites

- Node.js v 18.19.0
- Docker and Docker compose for Redis.
- TypeScript

### Installation

1. **Clone the repository:**

## Development mode:
- **docker compose -f redis-dc.yml up**
- **npm run dev** 

## Running Tests:
- **docker compose -f redis-dc.yml up**
- **npm test** 

Configuration
Rate limit settings can be adjusted in the config.ts file. Here, you can set the default rate limits and the window size (in milliseconds) for tracking requests.