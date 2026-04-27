'use client';

import React from 'react';
import { Sparkles, CheckCircle2, MessageSquare, Target, Zap } from 'lucide-react';

const templates = {
  warm_up: [
    "Aluno chegou pontual e engajado.",
    "Revisamos o vocabulário da última aula com sucesso.",
    "Conversa inicial fluida sobre o dia a dia."
  ],
  comprehensible_input: [
    "Entendeu bem os novos conceitos gramaticais.",
    "Apresentamos novas expressões idiomáticas.",
    "Foco em pronúncia de palavras complexas."
  ],
  guided_practice: [
    "Realizou os exercícios com pouca ajuda.",
    "Praticamos a estrutura através de exemplos reais.",
    "Correção de erros comuns de concordância."
  ],
  meaningful_output: [
    "Conseguiu aplicar o conteúdo em conversação livre.",
    "Demonstrou confiança ao expressar suas opiniões.",
    "Uso natural das novas estruturas aprendidas."
  ],
  consolidation: [
    "Aula concluída com excelente aproveitamento.",
    "Dever de casa focado nos pontos de dificuldade.",
    "Pronto para avançar para o próximo tópico."
  ]
};

export default function EvolutionTemplates({ onSelect, field }) {
  const fieldTemplates = templates[field] || [];

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {fieldTemplates.map((text, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onSelect(text)}
          className="text-[10px] font-bold px-3 py-1.5 bg-slate-100 hover:bg-primary/10 hover:text-primary text-slate-500 rounded-lg transition-all flex items-center gap-1.5 border border-transparent hover:border-primary/20"
        >
          <Sparkles size={10} />
          {text.length > 25 ? text.substring(0, 25) + '...' : text}
        </button>
      ))}
    </div>
  );
}
