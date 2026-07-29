import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/whatsapp-button";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Peak | Entrenamiento personalizado",
  description:
    "Entrenamiento personalizado presencial y online con Sebastián González.",
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
          <Navbar />
          {children}
          <Footer />
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}