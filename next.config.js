/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // ← Deve ser booleano, não objeto
  },
}
  module.exports = nextConfig