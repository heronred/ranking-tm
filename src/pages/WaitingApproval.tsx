import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, LogOut, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export const WaitingApproval: React.FC = () => {
  const { user, logOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 shadow-2xl relative z-10 text-center"
      >
        <div className="bg-orange-500/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-orange-500/30">
          <Clock className="w-10 h-10 text-orange-500 animate-pulse" />
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight mb-4 uppercase">
          Aguardando <span className="text-orange-500">Vínculo</span>
        </h1>
        
        <p className="text-slate-400 font-medium mb-8 leading-relaxed">
          Olá, <span className="text-white font-bold">{user?.displayName}</span>! Seu acesso foi registrado com sucesso.
          <br /><br />
          Para utilizar todas as funcionalidades da plataforma, o administrador precisa vincular seu e-mail (<span className="text-blue-400">{user?.email}</span>) a um atleta pré-cadastrado.
        </p>

        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 mb-8 text-left">
          <div className="flex items-start gap-4">
             <div className="bg-blue-500/20 p-2 rounded-lg">
                <Mail className="w-4 h-4 text-blue-400" />
             </div>
             <div>
                <p className="text-white text-xs font-bold uppercase tracking-tight mb-1">Próximo Passo</p>
                <p className="text-slate-500 text-xs font-medium">Contate o administrador do seu clube para realizar o vínculo do seu e-mail.</p>
             </div>
          </div>
        </div>

        <button
          onClick={logOut}
          className="w-full bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-700 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </button>
      </motion.div>

      <p className="mt-10 text-slate-600 font-mono text-[10px] uppercase tracking-[0.3em]">
        Nikkei Curitiba • Itinen Ranking
      </p>
    </div>
  );
};
