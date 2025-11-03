import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chord Progression App - MPC Studio",
  description: "Create and play chord progressions with your keyboard - By Danny Wilson",
  icons: {
    icon: [
      { url: '/images/favicon.jpg', type: 'image/jpeg' },
    ],
    apple: '/images/favicon.jpg',
    shortcut: '/images/favicon.jpg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/favicon.jpg" type="image/jpeg" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}