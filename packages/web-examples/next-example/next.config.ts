import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  
  // 静态导出配置（Cloudflare Pages 需要）
  // Vercel 会自动忽略这个配置，不影响 Vercel 部署
  ...(process.env.VERCEL ? {} : { output: 'export' }),
  
  // 图片配置
  images: {
    // 允许从 Unsplash 加载图片
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Cloudflare 静态导出需要关闭图片优化
    ...(process.env.VERCEL ? {} : { unoptimized: true }),
  },
};

export default nextConfig;