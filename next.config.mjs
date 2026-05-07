/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * Dev-only: stop browsers from caching webpack/CSS chunks under `/_next/`.
   * Without this, after `.next` is rebuilt or `next dev` restarts, an old tab can
   * still request previous chunk URLs → 404 → page renders with almost no CSS.
   * Production is unchanged (NODE_ENV !== "development").
   */
  async headers() {
    if (process.env.NODE_ENV !== "development") {
      return [];
    }
    return [
      {
        source: "/_next/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
