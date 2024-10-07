/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['localhost', 'votes.ori.wtf', 'ori.wtf'],
    },
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = { fs: false, net: false, tls: false };
        }
        config.experiments = {
            ...config.experiments,
            topLevelAwait: true,
        };
        return config;
    },
    experimental: {
        esmExternals: true
    }
};

export default nextConfig;