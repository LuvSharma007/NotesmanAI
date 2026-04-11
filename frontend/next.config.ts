import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output:"standalone",
  // eslint:{
  //   ignoreDuringBuilds:true
  // },
  async rewrites() {
    return [
      {
        source:"/api/v1/:path*",
        destination: process.env.NODE_ENV === "development" ?
        "http://localhost:4000/api/v1/:path*" : process.env.NEXT_PUBLIC_REDIRECT_API_URL!,
      }
    ]
  },
};

export default nextConfig;
