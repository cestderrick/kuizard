import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Limite par défaut = 1 Mo. On monte à 10 Mo pour permettre les uploads
      // d'images depuis un téléphone (souvent 3-6 Mo bruts).
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
