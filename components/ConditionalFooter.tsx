"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const isAdminPage = pathname.includes("/admin");

  // Non mostrare il footer nelle pagine admin
  if (isAdminPage) {
    return null;
  }

  return <Footer />;
}
