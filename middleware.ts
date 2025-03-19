import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiting for Edge Runtime
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  // Basic rate limiting
  const ip = request.ip || 'anonymous';
  const now = Date.now();
  const limit = 10;
  const windowMs = 60000; // 1 minute

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