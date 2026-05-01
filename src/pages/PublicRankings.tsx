import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { UserProfile, Category } from '../types';
import { Trophy, Search, Filter, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const CATEGORIES: Category[] = ["Federados", "Não federados", "Sub 11", "60+"];

export const PublicRankings: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>("Federados");
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = dbService.getRankings(selectedCategory, (data) => {
      setPlayers(data);
    });
    return () => unsub();
  }, [selectedCategory]);

  const filteredPlayers = players.filter(p => 
    p.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-start gap-6 sm:gap-8">
          <div className="flex items-center gap-4">
            <Link to="/login" className="p-3 bg-white/10 rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all">
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tênis de Mesa Pro</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Rankings Públicos</h1>
            </div>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl backdrop-blur-sm border border-white/10 overflow-x-auto no-scrollbar w-full sm:w-fit">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? "bg-orange-500 text-white shadow-lg" 
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">
        <div className="bg-white rounded-[24px] sm:rounded-[40px] border border-slate-200 shadow-xl overflow-hidden -mt-10 sm:-mt-20 relative z-10">
          <div className="p-5 sm:p-8 border-b bg-white flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="relative w-full sm:w-[400px]">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar atleta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-3 sm:py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium text-slate-900 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 text-slate-500 font-bold px-4 py-2 sm:px-6 sm:py-3 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 self-start sm:self-auto">
              <Filter className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] sm:text-sm">{filteredPlayers.length} atletas</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] border-b">
                  <th className="px-3 sm:px-10 py-6 text-left">Pos</th>
                  <th className="px-3 sm:px-10 py-6 text-left">Atleta</th>
                  <th className="px-3 sm:px-10 py-6 text-center">Pontos</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPlayers.map((player, index) => (
                  <motion.tr 
                    key={player.uid}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group hover:bg-slate-50/80 transition-all"
                  >
                    <td className="px-3 sm:px-10 py-4 sm:py-8">
                      <div className="flex items-center gap-2 sm:gap-4">
                        <span className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center font-black text-xs sm:text-lg ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600 shadow-sm' :
                          index === 1 ? 'bg-slate-100 text-slate-500' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                          'text-slate-300'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-10 py-4 sm:py-8">
                      <div className="flex items-center gap-2 sm:gap-5">
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-sm sm:text-xl border-2 border-white shadow-sm overflow-hidden flex-shrink-0">
                           {player.photoURL ? (
                             <img src={player.photoURL} alt="" className="w-full h-full object-cover" />
                           ) : (player.nickname || player.displayName).charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 text-sm sm:text-lg group-hover:text-orange-500 transition-colors uppercase tracking-tight truncate max-w-[120px] sm:max-w-none">
                            {player.nickname || player.displayName}
                          </span>
                          <span className="text-[8px] sm:text-[10px] text-slate-400 font-bold tracking-widest">{player.category}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-10 py-4 sm:py-8 text-center">
                      <div className="inline-flex flex-col items-center bg-slate-50 px-3 sm:px-6 py-1 sm:py-2 rounded-xl sm:rounded-2xl border border-slate-100 group-hover:bg-orange-500 group-hover:border-orange-600 transition-all">
                        <span className="text-base sm:text-2xl font-black text-slate-900 group-hover:text-white transition-colors">{player.rankingPoints}</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-400 font-medium pb-20">
          <p>© 2024 Tênis de Mesa Pro - Sistema de Gestão Esportiva</p>
          <div className="flex justify-center gap-6 mt-4 opacity-50">
            <span className="text-xs uppercase tracking-tighter font-black underline cursor-pointer">Termos</span>
            <span className="text-xs uppercase tracking-tighter font-black underline cursor-pointer">Privacidade</span>
            <span className="text-xs uppercase tracking-tighter font-black underline cursor-pointer">Suporte</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
