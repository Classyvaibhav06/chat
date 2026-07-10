import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Qwen3 Chat AI",
  description: "A premium, high-fidelity chat experience powered by Qwen3 Large Language Model.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}
