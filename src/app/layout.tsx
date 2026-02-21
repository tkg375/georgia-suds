import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/storefront/Header";
import Footer from "@/components/storefront/Footer";

export const metadata: Metadata = {
  title: "The Gilded Bar — Handcrafted Soaps",
  description: "Small-batch artisan soaps made from natural ingredients.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-stone-900 antialiased">
        <Providers>
          <Header />
          <div className="pt-16">{children}</div>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
