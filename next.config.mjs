/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;

// If deploying on default github.io/ResQRoute/ without custom domain
const basePath = isGithubActions && !process.env.CUSTOM_DOMAIN ? '/ResQRoute' : '';

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: isGithubActions ? 'export' : undefined,
  basePath: basePath || undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
