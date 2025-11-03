import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chord Progression App - MPC Studio",
  description: "Create and play chord progressions with your keyboard - By Danny Wilson",
  icons: {
    icon: '/images/6650DCC9-303A-4BC0-A852-FD67BD372CF4_1_102_o.jpeg',
    apple: '/images/6650DCC9-303A-4BC0-A852-FD67BD372CF4_1_102_o.jpeg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}