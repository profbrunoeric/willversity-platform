import AdaptiveHub from "@/components/Navigation/AdaptiveHub";

export default function DashboardLayout({ children }) {
  return (
    <div className="relative min-h-screen bg-slate-50">
      {/* 
        O conteúdo agora ocupa a largura total, criando uma sensação de liberdade e modernidade.
        O padding inferior (pb-32) garante que o conteúdo não seja escondido pelo AdaptiveHub.
      */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-32">
        {children}
      </main>
      
      {/* O Centro de Comando da plataforma */}
      <AdaptiveHub />
    </div>
  );
}
