import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  async rewrites() {
    // When mocks are disabled, proxy /api/* to the real backend.
    // When mocks are enabled, MSW intercepts /api/* before they reach the network.
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      return [];
    }
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1'}/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
