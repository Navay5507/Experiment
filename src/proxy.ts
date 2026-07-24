import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─── Route Definitions ────────────────────────────────────────────────────────
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicApiRoute = createRouteMatcher([
  "/api/webhooks(.*)",
  "/api/auth/meta(.*)",
  "/api/auth/instagram(.*)",
  "/api/billing/verify-coupon", // Coupon check on pricing page (unauthenticated)
]);

// ─── In-Memory Rate Limiter ───────────────────────────────────────────────────
const ipRequestMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute

const RATE_LIMITS: Record<string, number> = {
  "/api/billing": 20,  // Max 20 billing requests per IP per minute
  "/api/auth":    15,  // Max 15 auth requests per IP per minute
  "/api/":        60,  // Max 60 general API requests per IP per minute
};

function getRateLimit(pathname: string): number {
  for (const [prefix, limit] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) return limit;
  }
  return 120;
}

function isRateLimited(ip: string, pathname: string): boolean {
  const now = Date.now();
  const key = `${ip}:${pathname.split("/").slice(0, 3).join("/")}`;
  const entry = ipRequestMap.get(key);
  const max = getRateLimit(pathname);

  if (!entry || now > entry.resetAt) {
    ipRequestMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count++;
  return entry.count > max;
}

// ─── Block Known Attack Tools & Bad Bots ─────────────────────────────────────
const BAD_BOTS = [
  "sqlmap", "nikto", "nmap", "masscan", "zgrab",
  "python-httpx", "python-requests", "go-http-client",
  "libwww-perl",
];

function isBadBot(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();
  return BAD_BOTS.some((bot) => ua.includes(bot));
}

// ─── Security Headers (added to every response) ───────────────────────────────
function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://cdn.razorpay.com https://*.clerk.accounts.dev https://*.clerk.com https://clerk.autodrop.in https://va.vercel-scripts.com https://calendly.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://calendly.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.clerk.com https://*.instagram.com https://*.cdninstagram.com https://autodrop.in https://www.autodrop.in https://clerk.autodrop.in https://calendly.com",
      "connect-src 'self' https://*.supabase.co https://*.clerk.com https://*.clerk.accounts.dev https://clerk.autodrop.in https://api.razorpay.com https://checkout.razorpay.com wss://*.supabase.co https://calendly.com",
      "frame-src https://api.razorpay.com https://checkout.razorpay.com https://*.clerk.accounts.dev https://clerk.autodrop.in https://calendly.com https://*.calendly.com https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
    ].join("; ")
  );
  return response;
}

// ─── Main Middleware ───────────────────────────────────────────────────────────
export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // 1. Block known attack tools and bad bots
  const userAgent = req.headers.get("user-agent") || "";
  if (isBadBot(userAgent)) {
    console.warn(`[Security] Bad bot blocked: UA=${userAgent} IP=${ip}`);
    return new NextResponse("Forbidden", { status: 403 });
  }

  // 2. Rate limit API routes (skip webhooks — they verify their own signatures)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/webhooks/")) {
    if (isRateLimited(ip, pathname)) {
      console.warn(`[Security] Rate limit exceeded: IP=${ip} PATH=${pathname}`);
      return new NextResponse(
        JSON.stringify({ error: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        }
      );
    }
  }

  // 3. Allow public API routes without auth
  if (isPublicApiRoute(req)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // 4. Protect dashboard routes with Clerk auth
  if (isProtectedRoute(req)) {
    await auth.protect();
  }

  // 5. Add security headers to every response
  const response = NextResponse.next();
  return addSecurityHeaders(response);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
