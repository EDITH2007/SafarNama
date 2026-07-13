import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/signin", "/signup"]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();
  if (isProtectedRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
  if (isAuthRoute(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
});

export const config = {
  // Exclude /api/auth so the dedicated Node.js Route Handler handles auth proxying.
  // Middleware still runs on all other routes for token refresh and OAuth code exchange.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
