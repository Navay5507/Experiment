import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isPublicApiRoute = createRouteMatcher([
  "/api/webhooks(.*)",
  "/api/auth/meta(.*)",
  "/api/auth/instagram(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // Don't protect webhook endpoints - they verify signatures themselves
  if (isPublicApiRoute(req)) return;
  
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
