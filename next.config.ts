import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite abrir el servidor de desarrollo desde el teléfono en la misma red.
  allowedDevOrigins: ["192.168.1.4"],
};

export default nextConfig;
