import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      "images.unsplash.com",
      // Ajoutez ici tous les autres domaines que vous utilisez pour les images
    ],
  },
}

export default nextConfig
