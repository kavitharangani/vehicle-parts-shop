import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Only admins can manage system users
    if (path.startsWith("/users") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/customers/:path*",
    "/suppliers/:path*",
    "/vehicles/:path*",
    "/categories/:path*",
    "/parts/:path*",
    "/purchases/:path*",
    "/sales/:path*",
    "/returns/:path*",
    "/reports/:path*",
    "/users/:path*",
  ],
};
