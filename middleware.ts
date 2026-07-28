import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAuthConfigured } from "@/lib/config";

/**
 * Browsing is public. Section 3 of the brief requires an anonymous visitor to
 * be able to take the "Just start searching" path with zero friction, so the
 * home page, browse, and listing detail stay open.
 *
 * Signing in is required to build a profile, sell, or reach admin. This is the
 * first gate only. Every protected route checks authorization again on the
 * server, because middleware alone is not authorization.
 */
const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/sell(.*)",
  "/dashboard(.*)",
  "/dealer(.*)",
  "/admin(.*)",
]);

// Without Clerk credentials the middleware cannot verify anything. Pass through
// so the public site still serves, and let the health check report the gap.
const authConfigured = isAuthConfigured();

const withClerk = clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return NextResponse.next();

  const { userId } = await auth();
  if (userId) return NextResponse.next();

  // Send the visitor to sign in and return them here afterwards. auth.protect()
  // answers 404 instead, which reads as a broken link rather than a login step.
  const signIn = new URL("/sign-in", req.url);
  signIn.searchParams.set("redirect_url", req.nextUrl.pathname);
  return NextResponse.redirect(signIn);
});

export default authConfigured ? withClerk : () => NextResponse.next();

export const config = {
  matcher: [
    // Skip Next internals and static files, run on everything else.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
