/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      'sequelize',
      'sqlite3',
      'pg-hstore',
      'mysql2',
      'pg',
      'pg-native',
      'tedious',
      'oracledb',
      'better-sqlite3',
      '@prisma/client',
      '@prisma/extension-accelerate',
      'bcrypt',
    ],
  },
};

module.exports = nextConfig;
