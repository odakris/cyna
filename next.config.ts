import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // swcMinify: true, // Utilise le compilateur SWC pour la minification (plus rapide)
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
  // Optimisations de production
  poweredByHeader: false, // Supprime l'en-tête X-Powered-By pour la sécurité
  compress: true, // Active la compression
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Supprime les console.log en production
  },
  // Optimisations pour le développement et la production
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 heure
    pagesBufferLength: 5,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
