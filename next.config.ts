/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "*.r2.cloudflarestorage.com",
            },
            {
                protocol: "https",
                hostname: "images.madevic.cu",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
        ],
        formats: ["image/avif", "image/webp"],
    },

    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                ],
            },
        ];
    },
    // Eliminar el bloque redirects completamente
};

module.exports = nextConfig;