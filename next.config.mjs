import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 消除跨多级 lockfile 的工作区根目录警告
  outputFileTracingRoot: path.join(__dirname, ".."),
  // 避免根目录的 Remotion 专用 eslint 规则影响 Next.js 页面构建
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
