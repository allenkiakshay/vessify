import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/lib/auth"

// Define protected routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/api/proxy",
]

// Define public routes that should redirect to dashboard if authenticated
const publicRoutes = [
  "/login",
  "/register",
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get session from auth
  const session = await auth()
  const isAuthenticated = !!session?.user

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  )

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users trying to access public routes
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Check if user's email is verified for protected routes
  if (isProtectedRoute && isAuthenticated && !session.user.emailVerified) {
    // Allow access to verify-email page
    if (!pathname.startsWith("/verify-email")) {
      return NextResponse.redirect(new URL("/verify-email", request.url))
    }
  }

  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api/auth (NextAuth routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/auth).*)",
  ],
}
