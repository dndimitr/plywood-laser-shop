import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Include LightBurn cut files in serverless bundles for post-purchase downloads
  outputFileTracingIncludes: {
    "/api/orders/*/cut-files/*": ["./content/cut-files/**/*"],
  },
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
};

export default nextConfig;
