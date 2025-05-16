/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['img.clerk.com', 'app.hukusis.com'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://app.hukusis.com',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig 