// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/wikipedia/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.akamai.steamstatic.com',
        port: '',
        pathname: '/steam/apps/**',
      },
      {
        protocol: 'https',
        hostname: 'image.api.playstation.com',
        port: '',
        pathname: '/vulcan/ap/rnd/**',
      },
      {
        protocol: 'https',
        hostname: 'play-lh.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      { 
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/images/**', 
      },
    ],
  },
};

module.exports = nextConfig;