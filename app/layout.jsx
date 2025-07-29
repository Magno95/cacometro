import Manifest from "components/Manifest";
import "../styles/globals.css";

export const metadata = {
  title: {
    template: "%s | Netlify",
    default: "Netlify Starter"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
      </head>

      <Manifest />

      <body className="antialiased text-white bg-gray-900">{children}</body>
    </html>
  );
}
