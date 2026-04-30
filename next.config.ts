import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/avatars/:path*",
        destination: "/api/images/avatars/:path*",
      },
      {
        source: "/team_avatars/:path*",
        destination: "/api/images/team_avatars/:path*",
      },
    ];
  },
};

export default nextConfig;
