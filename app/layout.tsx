import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visagismo — Análise de Rosto",
  description: "Descubra o corte de cabelo e barba ideais para o seu formato de rosto.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#0f0f0f] text-[#f5f5f5] antialiased">
        {children}
      </body>
    </html>
  );
}
