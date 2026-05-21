import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReferralBridge",
  description: "Clinical trial patient recruitment",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
