import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Find My Fuel",
    short_name: "Find My Fuel",
    description: "Save time and money. Find cheap fuel close by.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0d9488",
  };
}
