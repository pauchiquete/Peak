"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/whatsapp-button";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPrivateDashboard = pathname.startsWith("/dashboard/");

  if (isPrivateDashboard) {
    return (
      <>
        {children}
        <WhatsAppButton />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}
