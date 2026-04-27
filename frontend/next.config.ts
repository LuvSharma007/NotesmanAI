import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output:"standalone",
  eslint:{
    ignoreDuringBuilds:true
  },
  async rewrites() {
    return [
      {
        source:"/api/v1/:path*",
        destination:"https://notesman.in/api/v1/:path*"
      }
    ]
  },
};

export default nextConfig;
