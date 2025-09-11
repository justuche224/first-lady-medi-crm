// import { Figtree } from "next/font/google";
// import { Instrument_Serif } from "next/font/google";
import type React from "react";
import type { Metadata } from "next";
// import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "@/components/theme-provider";

// const figtree = Figtree({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700"],
//   variable: "--font-figtree",
//   display: "swap",
// });

// const instrumentSerif = Instrument_Serif({
//   subsets: ["latin"],
//   weight: ["400"],
//   style: ["normal", "italic"],
//   variable: "--font-instrument-serif",
//   display: "swap",
// });

export const metadata: Metadata = {
  title: "City Gate Hospital",
  description: "Providing the best healthcare services to our patients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <style>{`
            html {
              font-family: ${figtree.style.fontFamily};
              --font-sans: ${figtree.variable};
              --font-mono: ${GeistMono.variable};
              --font-instrument-serif: ${instrumentSerif.variable};
            }
        `}</style> */}
      </head>
      {/* <body className={`${figtree.variable} ${instrumentSerif.variable}`}> */}
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <NextTopLoader />
          {children}
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
