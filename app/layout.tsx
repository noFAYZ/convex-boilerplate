import type { Metadata } from "next";
import { Geist, Geist_Mono,DM_Sans } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/convex-provider";
import { ThemeProvider } from "next-themes";
import localFont from 'next/font/local'

const geistSans = DM_Sans({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Convex Boilerplate",
  description: "Next.js boilerplate with Convex and authentication",
};

const myFont2 = localFont({
  src: [
    {
      path: '../public/fonts/Matter-Medium.otf',
      weight: '400',
    },
  ],
  variable: '--font-archia',
  display: 'swap',
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${myFont2.variable}  antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
