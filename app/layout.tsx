import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Good Lab Clinical Trials",
  description: "Clinical trial patient recruitment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Source+Serif+4:ital,opsz,wght@1,8..60,400;1,8..60,500&display=swap"
          rel="stylesheet"
        />
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}&libraries=places&loading=async`}
          async
          defer
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
