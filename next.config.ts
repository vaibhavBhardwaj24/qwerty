import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Disable static page generation for Clerk compatibility
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
