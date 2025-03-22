import { NextRequest } from 'next/server';

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Simple in-memory store for rate limiting
const store = new Map<string, { count: number; resetTime: number }>();

export class RateLimiter {
  private limit: number;
  private windowMs: number;

  constructor(options: RateLimitOptions) {
    this.limit = options.limit;
    this.windowMs = options.windowMs;
  }

  // Clean up expired entries
  private cleanup() {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now > value.resetTime) {
        store.delete(key);
      }
    }
  }

  // Get client IP from request
  private getClientIp(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    return ip;
  }

  // Check if request is allowed
  async check(request: NextRequest): Promise<RateLimitResult> {
    // Clean up expired entries
    this.cleanup();

    // Get client identifier (IP address)
    const clientIp = this.getClientIp(request);
    const key = `rate-limit:${clientIp}`;

    const now = Date.now();
    const resetTime = now + this.windowMs;

    // Get current state for this client
    const current = store.get(key) || { count: 0, resetTime };

    // If the reset time has passed, reset the counter
    if (now > current.resetTime) {
      current.count = 0;
      current.resetTime = resetTime;
    }

    // Increment the counter
    current.count += 1;

    // Update the store
    store.set(key, current);

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, this.limit - current.count);
    const reset = Math.ceil((current.resetTime - now) / 1000);

    // Return result
    return {
      success: current.count <= this.limit,
      limit: this.limit,
      remaining,
      reset,
    };
  }
}

// Helper function to apply rate limiting
export async function rateLimit(request: NextRequest, options: RateLimitOptions): Promise<RateLimitResult> {
  const limiter = new RateLimiter(options);
  return limiter.check(request);
}