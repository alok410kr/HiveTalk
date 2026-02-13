/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Required for Docker deployment
    images: {
        remotePatterns: [
            { hostname: 'uploadthing.com' },
            { hostname: 'utfs.io' },
        ],
    },
};

export default nextConfig;