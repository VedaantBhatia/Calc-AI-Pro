import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import SessionProvider from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calc AI Pro - Your AI-powered calculus assistant",
  description: "Your AI-powered calculus assistant. Enter an expression, choose an operation, and let AI do the math! It's mathemagical!",
  keywords: ["calculus", "AI", "mathematics", "derivative", "integral", "math solver"],
  authors: [{ name: "Calc AI Pro" }],
  openGraph: {
    title: "Calc AI Pro - AI-powered calculus assistant",
    description: "Your AI-powered calculus assistant. Enter an expression, choose an operation, and let AI do the math! It's mathemagical!",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calc AI Pro - AI-powered calculus assistant",
    description: "Your AI-powered calculus assistant. Enter an expression, choose an operation, and let AI do the math! It's mathemagical!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
