import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

const store = new Map<string, { count: number; minute: number }>();

function withRateLimit(key: string, max: number) {
  const minute = Math.floor(Date.now() / 60000);
  const current = store.get(key);
  if (!current || current.minute !== minute) {
    store.set(key, { count: 1, minute });
    return true;
  }
  if (current.count >= max) return false;
  current.count += 1;
  store.set(key, current);
  return true;
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!token?.sub) return NextResponse.redirect(new URL("/login", req.url));
    if (token.role !== "admin") return NextResponse.redirect(new URL("/agent", req.url));
  }

  if (pathname.startsWith("/agent")) {
    if (!token?.sub) return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
    if (!token?.sub) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (token.role === "agent") {
      const ip = req.headers.get("x-forwarded-for") ?? "ip";
      const key = `${token.sub}:${ip}`;
      const allowed = withRateLimit(key, 50);
      if (!allowed) {
        return NextResponse.json({ success: false, message: "Rate limit exceeded" }, { status: 429 });
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/api/:path*"]
};
