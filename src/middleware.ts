import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextFetchEvent, NextRequest } from "next/server";
import { authConfig } from "@/lib/auth.config";
import {
  categoryLandingById,
  categoryLandingPath,
} from "@/lib/category-landings";
import { occasionByCategoryId, occasionPath } from "@/lib/occasions";

const { auth } = NextAuth(authConfig);

type AuthMiddleware = (
  request: NextRequest,
  event: NextFetchEvent,
) => Response | void | Promise<Response | void>;

/** Old homepage search/category URLs — keep them working without touching session. */
function homepageSearchRedirect(request: NextRequest) {
  if (request.nextUrl.pathname !== "/") return null;

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (q) {
    const url = request.nextUrl.clone();
    url.pathname = "/katalog";
    url.search = `?q=${encodeURIComponent(q)}`;
    return NextResponse.redirect(url);
  }

  const cat = request.nextUrl.searchParams.get("cat");
  if (!cat) return null;

  const occasion = occasionByCategoryId(cat);
  if (occasion) {
    const url = request.nextUrl.clone();
    url.pathname = occasionPath(occasion.slug);
    url.search = "";
    return NextResponse.redirect(url);
  }

  const landing = categoryLandingById(cat);
  if (landing) {
    const url = request.nextUrl.clone();
    url.pathname = categoryLandingPath(landing.slug);
    url.search = "";
    return NextResponse.redirect(url);
  }

  const url = request.nextUrl.clone();
  url.pathname = "/katalog";
  url.search = `?cat=${encodeURIComponent(cat)}`;
  return NextResponse.redirect(url);
}

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return (auth as unknown as AuthMiddleware)(request, event);
  }
  return homepageSearchRedirect(request) ?? NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/"],
};
