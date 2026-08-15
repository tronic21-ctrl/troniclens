import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      accounts: "./src/utils/dummyAccounts.ts",
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      accounts: path.resolve("./src/utils/dummyAccounts.ts"),
    };
    return config;
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // This bypasses a known bug in Next 16 Turbopack route type generation
    // that causes corrupt routes.d.ts files.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
