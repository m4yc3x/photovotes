/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['cdn.discordapp.com'],
    },
    webpack: (config) => {
        config.resolve.fallback = { fs: false, net: false, tls: false };
        return config;
    },
};

export default nextConfig;