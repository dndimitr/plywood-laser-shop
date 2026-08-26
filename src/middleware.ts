import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Admin auth only — never touch SEO files (GSC sitemap/robots fetches).
     */
    "/admin/:path*",
  ],
};
