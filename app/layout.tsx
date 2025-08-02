import Header from "@/components/header/Header";
import Manifest from "../components/Manifest";
import "../styles/globals.css";
import ConditionalFooter from "@/components/ConditionalFooter";
import localFont from "next/font/local";

export const metadata = {
  title: {
    template: "%s | Caccometro",
    default: "Caccometro"
  }
};

const tungsten = localFont({
  src: "/fonts/Tungsten-Bold.woff",
  display: "swap"
});

export default async function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/icons/icon-192x192.png" sizes="any" />
      </head>

      <Manifest />

      <body className={tungsten.className + " antialiased text-white bg-gray-900 h-full flex flex-col"}>
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
        <ConditionalFooter />
      </body>
    </html>
  );
}
