import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hiteshchoudhary.com",
      },
    ],
  },
};

export default nextConfig;
