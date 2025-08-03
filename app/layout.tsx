import type { Metadata } from "next";
// import { Geist } from "next/font/google";
// import { ThemeProvider } from "next-themes";
import "./globals.css";
import Navbar from "@/components/Navbar";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "DG-A",
  description: "ระบบจัดการพนักงานและบริษัทแรงงานภายนอก",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-purple-100 antialiased">
        {/* <ThemeProvider> */}
        <Navbar />
        <div className=" m-3 p-6 bg-white border border-purple-200 rounded-2xl shadow-lg">
          {children}
        </div>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
