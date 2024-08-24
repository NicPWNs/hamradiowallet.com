import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HAMRadioWallet.com",
  description:
    "An app to add FCC Amateur Radio Licenses to Apple Wallet and Google Wallet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="bg-yellow-400 text-black text-center py-1 text-sm font-medium">
          🚧 Under Construction 🚧
        </div>
        {children}
      </body>
    </html>
  );
}
