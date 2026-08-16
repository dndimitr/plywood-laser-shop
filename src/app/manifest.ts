import type { MetadataRoute } from "next";
import { DEFAULT_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Breza",
    description: DEFAULT_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#fffcf7",
    theme_color: "#3b2a1e",
    lang: "bg",
    icons: [
      {
        src: "/brand/studio-breza-mark-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/studio-breza-mark-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
