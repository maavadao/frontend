import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (Cloud Run).
  output: "standalone",
  // GitHub avatars on the developer pages.
  images: { remotePatterns: [new URL("https://avatars.githubusercontent.com/**")] },
  // The directory was briefly at /ai-tools.
  async redirects() {
    return [
      { source: "/ai-tools", destination: "/directory", permanent: true },
      { source: "/ai-tools/:slug", destination: "/directory/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
