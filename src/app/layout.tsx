import type { Metadata } from "next";
import { Lato, Qwigley, Covered_By_Your_Grace } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const lato = Lato({
  variable: "--font-lato",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  display: "swap",
});

const qwigley = Qwigley({
  variable: "--font-qwigley",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const coveredByYourGrace = Covered_By_Your_Grace({
  variable: "--font-covered",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ghetto Barber",
  description: "Estilo urbano, tradición de barrio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${lato.variable} ${qwigley.variable} ${coveredByYourGrace.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
