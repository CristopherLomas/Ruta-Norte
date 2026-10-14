/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: '../.next',
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
