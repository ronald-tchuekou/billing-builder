import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000',
    '5efa-2605-59c0-1ee5-3510-3d5d-a67f-cedd-5184.ngrok-free.app',
    'billing-builder.vercel.app'
  ],
  experimental: {
    serverActions: {bodySizeLimit: "5mb"},
  },
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
