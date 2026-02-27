import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optionally proxy API calls to the backend in development
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "http://localhost:8000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
