import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  devIndicators: false,
  distDir: 'dist',
  trailingSlash: true,
};

export default nextConfig;
