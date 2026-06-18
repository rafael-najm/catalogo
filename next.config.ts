import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Libera todos os domínios de imagem usados pelo Yupoo e pelos produtos demo
    remotePatterns: [
      // CDN principal do Yupoo
      { protocol: "https", hostname: "**.yupoo.com" },
      { protocol: "https", hostname: "**.xiu.yupoo.com" },
      { protocol: "https", hostname: "**.photo.yupoo.com" },
      { protocol: "https", hostname: "photo.yupoo.com" },
      // Imagens de demonstração (Unsplash)
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
