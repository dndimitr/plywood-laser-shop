import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/idei", destination: "/blog", permanent: true },
      { source: "/idei/:slug", destination: "/blog/:slug", permanent: true },
      {
        source: "/",
        has: [{ type: "host", value: "www.studiobreza.eu" }],
        destination: "https://studiobreza.eu",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.studiobreza.eu" }],
        destination: "https://studiobreza.eu/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/xml; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
