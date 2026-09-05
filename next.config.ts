import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable server actions
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // For pitch deck uploads
    },
  },

  // Image optimization domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },

  // Redirect root to dashboard
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
