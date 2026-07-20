import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import { GoogleAnalytics } from "@next/third-parties/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: {
    default: "PDFTap — Free Online PDF Tools, No Signup Required",
    template: "%s | PDFTap",
  },
  description:
    "Free online tools to merge, split, compress, rotate, and convert PDFs, images, Word, Excel, and PowerPoint files. No signup. Files deleted after conversion. Works in your browser.",
  keywords: [
    "pdf tools online free", "merge pdf", "split pdf", "compress pdf", "pdf to word",
    "word to pdf", "pdf to jpg", "compress image", "excel to pdf", "powerpoint to pdf",
    "pdf converter free", "online pdf editor", "pdf tools no signup",
  ],
  alternates: { canonical: "https://www.getpdftap.com" },
  openGraph: {
    title: "PDFTap — Free Online PDF Tools, No Signup Required",
    description:
      "Merge, split, compress, rotate, and convert PDFs, images, Word, Excel, and PowerPoint files for free. No signup. Files deleted after conversion.",
    url: "https://www.getpdftap.com",
    siteName: "PDFTap",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "https://www.getpdftap.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "PDFTap — Free Online PDF Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PDFTap — Free Online PDF Tools, No Signup Required",
    description:
      "Merge, split, compress, rotate, and convert PDFs, images, Word, Excel, and PowerPoint files for free. No signup.",
    images: ["https://www.getpdftap.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  verification: {
    google: "7s4ym43V699W_2rKBFDZPaz_ihHuO_3IR9T1_eHNMcs",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatWidget />
        <GoogleAnalytics gaId="G-FE4BS4SPYK" />
      </body>
    </html>
  );
}
