import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnLoginPage = req.nextUrl.pathname === "/login";
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isPublicAsset = req.nextUrl.pathname.startsWith("/_next") || 
                        req.nextUrl.pathname.startsWith("/icons") ||
                        req.nextUrl.pathname === "/manifest.json" ||
                        req.nextUrl.pathname === "/sw.js";

  // Dozvoli pristup API rutama i public asset-ima
  if (isApiRoute || isPublicAsset) {
    return NextResponse.next();
  }

  // Ako je korisnik ulogovan i pokušava pristupiti login stranici
  if (isLoggedIn && isOnLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  // Ako korisnik nije ulogovan i nije na login stranici
  if (!isLoggedIn && !isOnLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)"],
};
