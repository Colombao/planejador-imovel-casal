import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planejador Patrimonial & Imóvel do Casal | CIO & CFP®",
  description:
    "Simulador interativo das 3 Caixas, Comparador Imóvel Pronto vs. Na Planta (MCMV Faixa 3/4, INCC, Evolução de Obra), Divisão Justa do Casal e Guia Prático de Investimentos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
