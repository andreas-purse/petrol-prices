import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Petrol Prices UK",
    short_name: "Petrol Prices",
    description: "Find the cheapest petrol and diesel prices near you",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
  };
}
