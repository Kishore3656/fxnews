import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["www.fxstreet.com", "i-invdn-com.investing.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
