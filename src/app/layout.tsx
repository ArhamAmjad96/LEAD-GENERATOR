import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { MobileNav } from "@/components/MobileNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadForge — B2B Website Sales Lead Generator",
  description: "Find local businesses without websites from Google Maps and generate high-conversion sales leads.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden w-full max-w-full">
      <body className={`${inter.className} bg-[#f0f3f8] text-slate-900 min-h-screen antialiased flex flex-col lg:flex-row overflow-x-hidden w-full max-w-full`}>
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:h-screen lg:overflow-hidden w-full max-w-full">
          <Header />
          <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-24 lg:pb-8 bg-[#f0f3f8] w-full max-w-full overflow-x-hidden lg:overflow-y-auto">
            <div className="max-w-7xl mx-auto space-y-5 sm:space-y-8 w-full max-w-full">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav />
      </body>
    </html>
  );
}
