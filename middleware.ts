import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting for Edge Runtime
const rateLimits = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every hour to prevent memory leaks
const CLEANUP_INTERVAL = 3600000; // 1 hour
let lastCleanup = Date.now();

function cleanupOldEntries() {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL) {
    for (const [ip, data] of rateLimits.entries()) {
      if (now > data.resetTime) {
        rateLimits.delete(ip);
      }
    }
    lastCleanup = now;
  }
}

export function middleware(request: NextRequest) {
  // Basic rate limiting
  const ip = request.ip || 'anonymous';
  const now = Date.now();
  const limit = parseInt(process.env.RATE_LIMIT || '10');
  const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'); // 1 minute

  // Periodically clean up old entries
  cleanupOldEntries();
  
  const currentLimit = rateLimits.get(ip);
  
  if (!currentLimit || now > currentLimit.resetTime) {
    rateLimits.set(ip, {
      count: 1,
      resetTime: now + windowMs
    });
  } else if (currentLimit.count >= limit) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please try again later.'
        }
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } else {
    rateLimits.set(ip, {
      count: currentLimit.count + 1,
      resetTime: currentLimit.resetTime
    });
  }

  return NextResponse.next();
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*'
}