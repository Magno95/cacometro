"use client";

import { usePathname } from "next/navigation";

export default function ConditionalBodyClass() {
  const pathname = usePathname();
  const isAdminPage = pathname.includes("/admin");

  // Applica classe diversa per le pagine admin
  if (typeof document !== "undefined") {
    const html = document.documentElement;
    const body = document.body;

    if (isAdminPage) {
      html.className = html.className.replace("h-full overflow-hidden", "h-full");
      body.className = body.className.replace(
        "antialiased text-white bg-gray-900",
        "antialiased text-white bg-gray-900 h-screen overflow-y-auto"
      );
    } else {
      if (!html.className.includes("overflow-hidden")) {
        html.className = html.className.replace("h-full", "h-full overflow-hidden");
      }
      body.className = body.className.replace("h-screen overflow-y-auto", "");
    }
  }

  return null;
}
