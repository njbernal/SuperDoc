/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.docx$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/docs/[name].[hash][ext]'
      }
    });
    return config;
  }
}

export default nextConfig
