import { auth } from "./server/auth"


export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/api/auth/authenticate") {
    const newUrl = new URL("/api/auth/authentication", req.nextUrl.origin)
    return Response.redirect(newUrl)
  }
})

export const config = {
  matcher: ["/find"],
}