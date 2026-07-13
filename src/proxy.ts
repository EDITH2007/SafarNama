import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAuthRoute = createRouteMatcher(["/signin", "/signup"]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const isAuthenticated = await convexAuth.isAuthenticated();
    if (isProtectedRoute(request) && !isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/signin");
    }
    if (isAuthRoute(request) && isAuthenticated) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }
  }
);

export const config = {
  // Run on all routes except static assets.
  // The proxy handles /api/auth proxying to Convex automatically.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
