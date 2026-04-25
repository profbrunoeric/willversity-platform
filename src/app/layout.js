import { Outfit } from "next/font/google";
import "./globals.css";
import ThemeInjector from "@/components/Theme/ThemeInjector";

const outfit = Outfit({ 
  subsets: ["latin"], 
  variable: '--font-outfit' 
});

export const metadata = {
  title: "Willversity - The University of English",
  description: "Plataforma de gestão e aprendizado para escolas de inglês modernas.",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} font-outfit antialiased bg-slate-50`}>
        <ThemeInjector />
        {children}
      </body>
    </html>
  );
}
