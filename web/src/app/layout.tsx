import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "IgrejasWeb OS",
  description: "Sistema Operacional para Gestão Eclesiástica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* suppressHydrationWarning={true} 
        CRÍTICO: Impede que extensões de navegador quebrem o site.
      */}
      <body
        className={`${inter.className} bg-neutral-950 text-neutral-50 antialiased selection:bg-emerald-500/30`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}