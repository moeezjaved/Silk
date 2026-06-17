import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silk is its own app; pin the workspace root to this folder so the
  // parent selfmade lockfile isn't picked up.
  turbopack: { root: __dirname },
};

export default nextConfig;
