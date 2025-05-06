/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "i9.ytimg.com", // YouTube video thumbnails
      "i.ytimg.com", // YouTube video thumbnails (alternate domain)
      "yt3.ggpht.com", // YouTube channel avatars
      "yt3.googleusercontent.com", // YouTube channel banners and other assets
    ],
  },
  experimental: {
    serverActions: {}
  },
  output: "standalone",
};  

module.exports = nextConfig;
