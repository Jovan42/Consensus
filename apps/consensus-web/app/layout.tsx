import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import Navigation from "./components/layout/Navigation";
import { AuthenticatedFetchScript } from "./components/AuthenticatedFetchScript";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Consensus - Club Management App",
  description: "A modern app for managing book clubs, movie nights, and other group activities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthenticatedFetchScript />
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}