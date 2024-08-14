import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { NextThemeProvider } from "@/lib/providers/next-theme-provider";
import db from "@/lib/supabase/db";
import Navbar from "@/components/navbar";
import { CustomProvider } from "@/lib/providers/customProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Notion-clone",
  description: " app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  db;
  return (
    <html lang="en" className="flex h-full w-full bg-black/[0.9] text-white">
      
      <body className={inter.className + "h-full w-full"}>
        {/* <NextThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableColorScheme
        > */}
        <div className="fixed border-b-2 border-black w-full">
          <Navbar />
        </div>
        <CustomProvider>{children}</CustomProvider>
        {/* </NextThemeProvider> */}
      </body>
    </html>
  );
}
