import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (Cloud Run).
  output: "standalone",
  // GitHub avatars on the developer pages.
  images: { remotePatterns: [new URL("https://avatars.githubusercontent.com/**")] },
};

export default nextConfig;
