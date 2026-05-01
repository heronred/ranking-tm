import React from 'react';
import { Activity } from 'lucide-react';

export const Stats: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
      <div className="bg-slate-100 p-8 rounded-[40px]">
        <Activity className="w-16 h-16 text-slate-400 animate-pulse" />
      </div>
      <div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-4">Estatísticas em Breve</h1>
        <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
          Estamos aprimorando nosso motor de análise para fornecer dados mais precisos e insights inteligentes sobre sua performance.
        </p>
      </div>
      <div className="pt-4">
        <span className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
          Módulo em Manutenção
        </span>
      </div>
    </div>
  );
};
