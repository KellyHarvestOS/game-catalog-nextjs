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
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ru.pinterest.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shared.fastly.steamstatic.com',
        port: '',
        pathname: '/store_item_assets/steam/apps/**',
      },
      {
        protocol: 'https',
        hostname: 'hot.game',
        port: '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'img.itch.zone',
        port: '',
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: 'grandgames.net', 
        port: '',
        pathname: '/img/embedgames/**', 
      },
            {
        protocol: 'https',
        hostname: 'grandgames.net',
      },
        {
        protocol: 'https',
        hostname: 'store-images.s-microsoft.com',
        port: '',
        pathname: '/image/apps.**',
      },
        {
        protocol: 'https',
        hostname: 'cdn1.epicgames.com',
        port: '',
        pathname: '/**',
      },
      {
  protocol: 'https',
  hostname: 'cdn.akamai.steamstatic.com',
  port: '',
  pathname: '/steam/apps/**',
},
{
  protocol: 'https',
  hostname: 'cdn.akamai.steamstatic.com',
  port: '',
  pathname: '/**', // Разрешает все пути
},
{
  protocol: 'https',
  hostname: 'i.playground.ru',
  port: '',
  pathname: '/**',
},
    ],
  },
};

module.exports = nextConfig;
