/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false, // Disable "Development" banner in dev mode for cleaner UI  
  images: {
    remotePatterns: [
      // Vercel Blob Storage
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com',
      },
      // Imgur, Cloudinary, etc. — catch-all for external product images
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
