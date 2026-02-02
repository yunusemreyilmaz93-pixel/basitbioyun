import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Futbol Grafik Stüdyosu',
  description: 'Profesyonel futbol grafikleri oluşturun - Maç kartları, puan durumu, transfer grafikleri ve daha fazlası',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
