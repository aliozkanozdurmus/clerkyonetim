import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/"],
  ignoredRoutes: ["/api/webhook"],
  afterAuth(auth, req, evt) {
    // Handle custom domain
    if (req.url.includes('app.hukusis.com')) {
      // You can add custom logic here if needed
    }
  }
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}; 