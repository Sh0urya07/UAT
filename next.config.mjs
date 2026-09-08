/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['playwright', 'playwright-core', '@axe-core/playwright'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'playwright', 'playwright-core', '@axe-core/playwright'];
    }
    return config;
  },
};

export default nextConfig;
