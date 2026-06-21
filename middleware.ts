import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Protected app surfaces: buyer, seller, dealer areas.
const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/browse(.*)",
  "/listing(.*)",
  "/sell(.*)",
  "/dashboard(.*)",
  "/dealer(.*)",
]);

// Clerk needs a secret key to verify sessions. If it isn't configured (e.g. a
// fresh deploy before secrets are set), run a no-op middleware so the public
// site still loads instead of 500-ing every route.
const clerkConfigured = Boolean(process.env.CLERK_SECRET_KEY);

const withClerk = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export default clerkConfigured ? withClerk : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
