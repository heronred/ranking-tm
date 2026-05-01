import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Match, Challenge, UserProfile } from '../types';
import { Clock, Swords, Check, X, Calendar as CalendarIcon, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export const MyMatches: React.FC = () => {
  const { profile } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    if (!profile) return;
    const unsubMatches = dbService.getUserMatches(profile.uid, setMatches);
    const unsubChallenges = dbService.getChallenges(profile.uid, setChallenges);
    return () => {
      unsubMatches();
      unsubChallenges();
    };
  }, [profile]);

  const handleAcceptChallenge = async (challenge: Challenge) => {
    if (!profile) return;
    const myName = profile.nickname || profile.displayName;
    await dbService.acceptChallenge(
      challenge.id!, 
      challenge.challengerName, 
      myName, 
      challenge.challengerId, 
      profile.uid, 
      challenge.category
    );
    alert('Desafio aceito! O administrador agendará a partida em breve.');
  };

  const handleRefuseChallenge = async (challengeId: string) => {
    if (confirm('Deseja recusar este desafio?')) {
      await dbService.refuseChallenge(challengeId);
      alert('Desafio recusado.');
    }
  };

  return (
    <div className="space-y-12">      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Meus Jogos</h1>
          <p className="text-slate-500 font-medium font-mono uppercase text-[10px] sm:text-xs tracking-widest">Histórico e Agendamentos</p>
        </div>
      </div>

      {/* Challenges Section */}
      {challenges.length > 0 && (
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500 rounded-2xl flex items-center justify-center">
              <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold">Desafios Recebidos</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {challenges.map(challenge => (
              <motion.div 
                key={challenge.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white p-5 sm:p-6 rounded-[24px] sm:rounded-3xl border-2 border-yellow-500/20 shadow-xl shadow-yellow-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Novo Desafio!</p>
                  <p className="text-base sm:text-lg font-black text-slate-900 leading-tight">{challenge.challengerName} desafiou você!</p>
                  <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1">{challenge.category}</p>
                </div>
                <div className="flex gap-2 self-end sm:self-auto">
                  <button 
                    onClick={() => handleAcceptChallenge(challenge)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleRefuseChallenge(challenge.id!)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Matches Grid */}
      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-2xl flex items-center justify-center">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold">Histórico de Partidas</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {matches.length === 0 ? (
            <div className="col-span-full py-16 sm:py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
              <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Nenhuma partida registrada.</p>
            </div>
          ) : (
            matches.map(match => {
              const isP1 = match.player1Id === profile?.uid;
              const isWinner = match.winnerId === profile?.uid;
              const myScore = isP1 ? match.player1Score : match.player2Score;
              const oppScore = isP1 ? match.player2Score : match.player1Score;
              const oppName = isP1 ? match.player2Name : match.player1Name;

              return (
                <motion.div 
                  key={match.id}
                  className={`bg-white p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}
                >
                  <div className={`absolute top-0 right-0 px-4 py-2 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest ${
                    match.status === 'finished' ? (isWinner ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 text-slate-400') : 'bg-blue-500 text-white animate-pulse'
                  }`}>
                    {match.status === 'finished' ? (isWinner ? 'Vitória' : 'Derrota') : 'Agendado'}
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(new Date(match.date), "dd 'de' MMM", { locale: ptBR })}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">{match.type === 'tournament' ? 'Torneio' : 'Desafio'}</span>
                        <span className="font-black text-slate-900 group-hover:text-orange-500 transition-colors truncate">vs {oppName}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5 flex-shrink-0">
                        <span className={`text-4xl font-black tracking-tighter ${isWinner ? 'text-emerald-500' : 'text-slate-900'}`}>{myScore}</span>
                        <span className="text-slate-200 font-black text-xl">/</span>
                        <span className="text-2xl font-black text-slate-300 tracking-tighter">{oppScore}</span>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-slate-50 flex items-center justify-between">
                      <div className="p-2 bg-slate-50 rounded-xl text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                        Match ID: {match.id.slice(0, 6)}
                      </div>
                      <button className="text-orange-500 font-black text-[10px] uppercase tracking-widest hover:text-orange-600 transition-colors">
                        Ver Súmula
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
