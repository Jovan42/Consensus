import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import Navigation from "./components/layout/Navigation";
import { AuthenticatedFetchScript } from "./components/AuthenticatedFetchScript";
import { ThemeScript } from "./components/ThemeScript";
import BannedUserRedirect from "./components/auth/BannedUserRedirect";

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
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <AuthenticatedFetchScript />
        <Providers>
          <BannedUserRedirect>
            <Navigation />
            {children}
          </BannedUserRedirect>
        </Providers>
      </body>
    </html>
  );
}