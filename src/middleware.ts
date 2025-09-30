import { auth } from "./server/auth";

export default auth((req) => {
  try {
    if (!req.auth && req.nextUrl.pathname !== "/api/auth/authentication") {
      const newUrl = new URL("/api/auth/authentication", req.nextUrl.origin);
      return Response.redirect(newUrl);
    }

    return;
  } catch (error) {
    throw new Error("❌ Middleware error", { cause: error });


  }
});

export const config = {
  matcher: ["/find-job"],
};
