import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { UserProfile, Category, Challenge } from '../types';
import { Trophy, Swords, Search, Filter, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: Category[] = ["Federados", "Não federados", "Sub 11", "60+"];

export const Rankings: React.FC = () => {
  const { profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<Category>(profile?.category || "Federados");
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [sentChallenges, setSentChallenges] = useState<Challenge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubRankings = dbService.getRankings(selectedCategory, (data) => {
      setPlayers(data);
    });

    let unsubChallenges = () => {};
    if (profile) {
      unsubChallenges = dbService.getSentChallenges(profile.uid, (data) => {
        setSentChallenges(data);
      });
    }

    return () => {
      unsubRankings();
      unsubChallenges();
    };
  }, [selectedCategory, profile]);

  const filteredPlayers = players.filter(p => 
    (p.nickname || p.displayName).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChallenge = async (challengedId: string, challengedName: string, challengedIndex: number) => {
    if (!profile) return;

    // Rule: Can only challenge up to 5 positions above
    const userIndex = players.findIndex(p => p.uid === profile.uid);
    if (userIndex === -1) {
      alert("Você não está neste ranking ainda.");
      return;
    }

    // Positions are index based. index 0 is Pos 1.
    // If user is at index 10 (Pos 11), they can challenge index 5, 6, 7, 8, 9 (Pos 6 to 10)
    // challengedIndex must be < userIndex AND challengedIndex >= userIndex - 5
    
    if (challengedIndex > userIndex) {
      alert("Você não pode desafiar atletas em posição inferior a sua.");
      return;
    }

    if (challengedIndex < userIndex - 5) {
      alert("Você só pode desafiar atletas até 5 posições acima de você.");
      return;
    }

    if (confirm(`Deseja desafiar ${challengedName} para uma partida valendo pontos?`)) {
      const challengerName = profile.nickname || profile.displayName;
      await dbService.createChallenge(profile.uid, challengerName, challengedId, challengedName, profile.category);
      alert('Desafio enviado! Aguarde a aceitação do adversário.');
    }
  };

  const isChallengePending = (challengedId: string) => {
    return sentChallenges.some(c => c.challengedId === challengedId && c.status === 'pending');
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Rankings</h1>
          <p className="text-slate-500 font-medium font-mono uppercase text-xs tracking-widest">Tabela de Classificação Global</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar scroll-smooth">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar jogador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
              />
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
              <Filter className="w-4 h-4" />
              <span>{filteredPlayers.length} atletas encontrados</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
                  <th className="px-3 sm:px-8 py-4 text-left">Pos</th>
                  <th className="px-3 sm:px-8 py-4 text-left">Atleta</th>
                  <th className="px-3 sm:px-8 py-4 text-center">Pontos</th>
                  <th className="px-3 sm:px-8 py-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <AnimatePresence>
                  {filteredPlayers.map((player, index) => (
                    <motion.tr 
                      key={player.uid}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group hover:bg-slate-50/80 transition-colors ${player.uid === profile?.uid ? 'bg-orange-50/50' : ''}`}
                    >
                      <td className="px-3 sm:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                            index === 0 ? 'bg-yellow-100 text-yellow-600' :
                            index === 1 ? 'bg-slate-100 text-slate-600' :
                            index === 2 ? 'bg-orange-100 text-orange-600' :
                            'text-slate-400'
                          }`}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-8 py-4 sm:py-6">
                        <div className="flex items-center gap-2 sm:gap-4">
                          {player.photoURL ? (
                            <img src={player.photoURL} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase text-[10px] sm:text-xs min-w-[32px] min-h-[32px]">
                              {(player.nickname || player.displayName).charAt(0)}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs sm:text-base text-slate-900 leading-tight truncate max-w-[100px] sm:max-w-none">{player.nickname || player.displayName}</span>
                            {player.nickname && <span className="text-[8px] sm:text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[100px] sm:max-w-none">({player.displayName})</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-8 py-4 sm:py-6 text-center">
                        <span className="font-mono font-black text-slate-900 text-sm sm:text-base">{player.rankingPoints}</span>
                      </td>
                      <td className="px-3 sm:px-8 py-4 sm:py-6 text-center">
                        {player.uid !== profile?.uid && player.category === profile?.category && (
                          isChallengePending(player.uid) ? (
                            <div className="flex flex-col items-center gap-1">
                               <Clock className="w-4 h-4 text-orange-500 animate-pulse" />
                               <span className="text-[8px] font-black uppercase text-orange-500 tracking-tighter">Aguardando</span>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleChallenge(player.uid, player.nickname || player.displayName, index)}
                              className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-orange-500 transition-all group-hover:scale-110 active:scale-95 shadow-lg shadow-slate-900/10"
                              title="Desafiar Atleta"
                            >
                              <Swords className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
