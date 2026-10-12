// src/app/layout.tsx

import '@/styles/globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { UnsavedChangesGuardProvider } from '@/hooks/useUnsavedChangesGuard'

import type { Metadata } from "next";
import ConditionalWhatsAppButton from '@/components/ConditionalWhatsAppButton';

export const metadata: Metadata = {
  title: {
    default: "AI4Planning",
    template: "%s | AI4Planning",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export const viewport = {
  themeColor: "#0A0E1A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0E1A] text-[#E8F0FF] antialiased">
        <ToastProvider>
          <UnsavedChangesGuardProvider>
            {children}
          </UnsavedChangesGuardProvider>
        </ToastProvider>
        <ConditionalWhatsAppButton />
      </body>
    </html>
  );
}