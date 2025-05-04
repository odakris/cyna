import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true, // Désactiver temporairement pour le développement
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
    ],
  },
}

export default nextConfig
