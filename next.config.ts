import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/noaa/:path*',
        destination: 'https://services.swpc.noaa.gov/:path*',
      },
      {
        source: '/api/nasa/:path*',
        destination: 'https://api.nasa.gov/:path*',
      },
      {
        source: '/api/dsn/:path*',
        destination: 'https://eyes.nasa.gov/dsn/data/:path*',
      },
      {
        source: '/api/tinygs/:path*',
        destination: 'https://api.tinygs.com/v1/:path*',
      },
    ];
  },
};

export default nextConfig;
