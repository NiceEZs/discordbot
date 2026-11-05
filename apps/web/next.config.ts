import type { NextConfig } from "next";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";

// Wspólny .env z roota monorepo
loadEnv({ path: resolve(__dirname, "../../.env") });
loadEnv({ path: resolve(__dirname, ".env") });

const nextConfig: NextConfig = {
  transpilePackages: ["@nice-hvh/db"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

export default nextConfig;
