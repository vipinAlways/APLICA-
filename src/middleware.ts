import { auth } from "./server/auth";

export default auth((req) => {
  try {
    if (!req.auth && req.nextUrl.pathname !== "/api/auth/authentication") {
      console.log("🔄 Redirecting to auth...");
      const newUrl = new URL("/api/auth/authentication", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }

    console.log("✅ Allowing request to proceed");
    return;
  } catch (error) {
    console.error("❌ Middleware error:", error);

    return;
  }
});

export const config = {
  matcher: ["/find-job"],
};
