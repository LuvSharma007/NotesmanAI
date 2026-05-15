import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output:"standalone",
  eslint:{
    ignoreDuringBuilds:true
  },
  async rewrites() {
    const urlCompitable = process.env.INTERNAL_BACKEND_URL || "https://notesman.in"

    return [
      {
        source:"/api/v1/:path*",
        destination: `${urlCompitable}/api/v1/:path*`
      },
      {
				source: "/api/auth/:path*",
				destination: `${urlCompitable}/api/auth/:path*`
			}
    ]
  },
};

export default nextConfig;
