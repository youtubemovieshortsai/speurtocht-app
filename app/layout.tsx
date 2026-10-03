import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bankzitters The Game",
  description: "Een spannend real-life spel met vrienden.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
