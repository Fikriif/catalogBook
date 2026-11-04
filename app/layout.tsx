import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Libra - Library Book Loan Management",
  description: "Sistem Manajemen Peminjaman dan Pengembalian Buku Perpustakaan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
       <ClerkProvider>
        {children}
       </ClerkProvider>
      </body>
    </html>
  );
}
