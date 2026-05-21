import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/lander",
  assetPrefix: "/lander",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
