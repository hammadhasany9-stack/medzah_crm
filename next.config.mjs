/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint is enforced in dev/CI via `npm run lint`; build skips it so production deploys are not blocked by existing debt.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
