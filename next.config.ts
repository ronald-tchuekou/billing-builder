import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['localhost:3000', '7138-2605-59c0-1ef2-2810-dde0-6196-c058-2417.ngrok-free.app', 'https://billing-builder.vercel.app'],
  experimental: {
    serverActions: {bodySizeLimit: "5mb"},
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
