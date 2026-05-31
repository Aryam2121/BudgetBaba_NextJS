import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { CurrencyProvider } from "@/contexts/CurrencyContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Budget Baba",
  description: "Your wise financial companion for smart budgeting, expense tracking, and achieving financial freedom",
  generator: "Next.js",
  keywords: ["budget baba", "budgeting app", "expense tracker", "financial wisdom", "money management", "personal finance", "smart budgeting"],
  authors: [{ name: "Budget Baba Team" }],
  creator: "Budget Baba",
  publisher: "Budget Baba",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://budgetbaba.com'),
  openGraph: {
    title: "Budget Baba",
    description: "Your wise financial companion for smart budgeting, expense tracking, and achieving financial freedom",
    type: "website",
    locale: "en_US",
    siteName: "Budget Baba",
  },
  twitter: {
    card: "summary_large_image",
    title: "Budget Baba",
    description: "Your wise financial companion for smart budgeting, expense tracking, and achieving financial freedom",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo-512.svg" />
        <meta name="theme-color" content="#8B5CF6" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <AuthProvider>
              <CurrencyProvider>
                {children}
                <Toaster />
              </CurrencyProvider>
            </AuthProvider>
          </Suspense>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
