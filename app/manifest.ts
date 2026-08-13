import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PET TAXI",
    short_name: "PET TAXI",
    description: "PET TAXI Web App",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8ead3",
    theme_color: "#ead7c0",
    icons: [
      {
        src: "/icons/icon_192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon_512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
