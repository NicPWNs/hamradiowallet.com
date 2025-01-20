import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HAMRadioWallet.com",
  description:
    "An app to add FCC Amateur Radio Licenses to Apple Wallet and Google Wallet.",
  icons: {
    apple: "/apple-icon.png",
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="theme-color"
          content="rgb(245 245 245)"
          media="(prefers-color-scheme: light)"
        ></meta>
        <meta
          name="theme-color"
          content="rgb(38 38 38)"
          media="(prefers-color-scheme: dark)"
        ></meta>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
