import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { AuthProvider } from "@/lib/contexts/AuthContext";
import { ChatDialog } from "@/components/chat-dialog";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpeedTrials 2025 - Georgia Drinking Water Data Explorer",
  description: "Exploring Q1 2025 SDWIS data for Georgia's public water systems",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <Navigation />
          {children}
          <ChatDialog />
        </AuthProvider>
      </body>
    </html>
  );
}
