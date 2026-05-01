import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const { user, signIn, loading } = useAuth();

  if (loading) return null;
  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 overflow-hidden relative">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl p-10 rounded-[32px] border border-white/10 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            className="bg-orange-500 p-5 rounded-3xl mb-6 shadow-xl shadow-orange-500/20"
          >
            <Trophy className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 uppercase">
            Tênis de Mesa <span className="text-orange-500">Pro</span>
          </h1>
          <p className="text-slate-400 font-medium">A plataforma de elite para atletas de tênis de mesa.</p>
        </div>

        <button
          onClick={signIn}
          className="w-full bg-white text-slate-900 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-[0.98] shadow-lg mb-4"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Entrar com Google
        </button>

        <Link 
          to="/public-rankings"
          className="w-full border border-white/20 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/5 transition-all shadow-lg"
        >
          Ver Rankings Públicos
        </Link>

        <p className="mt-8 text-center text-slate-500 text-sm">
          Ao entrar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex gap-8 text-slate-500 font-mono text-xs uppercase tracking-widest"
      >
        <span>Federados</span>
        <span>Sub 11</span>
        <span>60+</span>
        <span>Ranking Real-time</span>
      </motion.div>
    </div>
  );
};
