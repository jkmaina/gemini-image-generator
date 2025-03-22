import { RateLimiter } from '@/lib/rate-limit';

// Create a rate limiter instance
export const limiter = new RateLimiter({
  limit: parseInt(process.env.RATE_LIMIT || '10'),
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
});