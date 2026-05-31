import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@lobehub/icons', '@lobehub/ui'],
  output:"standalone",
  eslint:{
    ignoreDuringBuilds:true
  },
  compiler:{
    removeConsole:false,
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
