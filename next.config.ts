import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Excluir 'duckdb' y 'node-pre-gyp' del proceso de Webpack
      config.externals = [
        ...config.externals,
        "duckdb",
        "@mapbox/node-pre-gyp",
      ];
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s.gr-assets.com",
      },
      {
        protocol: "https",
        hostname: "images.gr-assets.com",
      },
      {
        protocol: "https",
        hostname: "i.gr-assets.com",
      },
    ],
  },
};

export default nextConfig;
