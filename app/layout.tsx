import type { Metadata } from "next";
import "./globals.css";

import SiteShell from "@/components/layout/SiteShell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Peak Level Training | Coaches de salud y rendimiento",
  description:
    "Entrenamiento personalizado con coaches enfocados en mejorar tu salud, fuerza y rendimiento.",
  icons: {
    icon: "/Peak-Level-Training-logos/02-logo-corto.png",
    apple: "/Peak-Level-Training-logos/02-logo-corto.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning data-scroll-behavior="smooth">
      <body>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
