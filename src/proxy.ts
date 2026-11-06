import { NextResponse, type NextRequest } from "next/server";

/**
 * Cheap edge gate: bounce visitors without a session cookie away from /admin.
 * The real session check (DB lookup) happens in the admin layout and every server action.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!req.cookies.has("era_admin")) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
