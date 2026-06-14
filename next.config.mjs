/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.cloudflarestream.com" },
      { protocol: "https", hostname: "imagedelivery.net" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
