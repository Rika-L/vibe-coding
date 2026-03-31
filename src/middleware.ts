import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 需要认证的路由
const protectedPaths = ["/dashboard", "/history", "/report"];

// 认证页面（已登录时重定向）
const authPages = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth-token")?.value;

  // 检查是否是受保护的路由
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  // 检查是否是认证页面
  const isAuthPage = authPages.some((path) => pathname === path);

  // 如果是受保护的路由且没有 token，重定向到登录页
  if (isProtectedPath && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果是认证页面且有 token，重定向到首页
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - api 路由（除了 auth/me）
     * - _next/static
     * - _next/image
     * - favicon.ico
     * - public 文件
     */
    "/((?!api(?!/auth/me)|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
