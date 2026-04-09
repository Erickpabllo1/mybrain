import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Arquitetura — Organizador Pessoal',
  description: 'Organizador Pessoal',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
