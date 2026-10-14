/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/presentacion',
        destination: '/presentacion.html',
      },
    ];
  },
};

export default nextConfig;
