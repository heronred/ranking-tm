import React, { useEffect, useState } from 'react';
import { dbService } from '../services/db';
import { Tournament, Match } from '../types';
import { Calendar, Trophy, Users, Loader2, ArrowLeft, Swords, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export const Tournaments: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [tournamentMatches, setTournamentMatches] = useState<Match[]>([]);

  useEffect(() => {
    const unsub = dbService.getTournaments((data) => {
      setTournaments(data.filter(t => t.isActive !== false));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      const unsub = dbService.getTournamentMatches(selectedTournament.id!, (data) => {
        setTournamentMatches(data);
      });
      return () => unsub();
    }
  }, [selectedTournament]);

  if (selectedTournament) {
    return (
      <div className="space-y-8 pb-10">
        <button 
          onClick={() => setSelectedTournament(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para lista
        </button>

        <div className="bg-slate-900 rounded-[32px] p-8 sm:p-12 text-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] -mr-32 -mt-32" />
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">
                  {selectedTournament.category}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/20 ${
                  selectedTournament.status === 'active' ? 'text-green-400' : 
                  selectedTournament.status === 'finished' ? 'text-blue-400' : 'text-slate-400'
                }`}>
                  {selectedTournament.status === 'active' ? 'Em Andamento' :
                   selectedTournament.status === 'finished' ? 'Finalizado' : 'Agendado'}
                </span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4">{selectedTournament.name}</h1>
              <p className="text-slate-400 max-w-2xl text-lg font-medium leading-relaxed">{selectedTournament.description}</p>
              
              <div className="flex flex-wrap gap-8 mt-10 p-6 bg-white/5 rounded-3xl border border-white/10">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                       <Calendar className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Início</p>
                       <p className="font-bold">{format(new Date(selectedTournament.startDate), "dd 'de' MMMM", { locale: ptBR })}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                       <Swords className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Partidas</p>
                       <p className="font-bold">{tournamentMatches.length} Jogos</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Histórico de Partidas</h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <div className="w-2 h-2 rounded-full bg-blue-500" /> Finalizados
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournamentMatches.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-400 font-medium">Nenhuma partida registrada para este torneio.</p>
              </div>
            ) : (
              tournamentMatches.map((match) => (
                <div key={match.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-6 border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                       {match.date ? format(new Date(match.date), "dd/MM HH:mm") : 'DATA N/D'}
                     </span>
                     {match.status === 'finished' ? (
                       <div className="flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
                         <CheckCircle2 className="w-3 h-3" />
                         <span className="text-[10px] font-black uppercase tracking-tighter">Finalizado</span>
                       </div>
                     ) : (
                       <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1 rounded-full">
                         <Clock className="w-3 h-3" />
                         <span className="text-[10px] font-black uppercase tracking-tighter">Agendado</span>
                       </div>
                     )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative">
                    {/* Vertical Divider */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center z-10">
                      <span className="text-[10px] font-black text-slate-300">VS</span>
                    </div>

                    <div className={`p-4 rounded-2xl flex flex-col items-center gap-3 ${match.status === 'finished' && match.player1Score > match.player2Score ? 'bg-green-50' : 'bg-slate-50'}`}>
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl shadow-sm">
                        {match.player1Name.charAt(0)}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 truncate w-24">Atleta 1</p>
                        <p className={`text-sm font-black tracking-tight ${match.status === 'finished' && match.player1Score > match.player2Score ? 'text-green-600' : 'text-slate-900'}`}>
                          {match.player1Name}
                        </p>
                      </div>
                      {match.status === 'finished' && (
                        <div className="text-2xl font-black text-slate-900">{match.player1Score}</div>
                      )}
                    </div>

                    <div className={`p-4 rounded-2xl flex flex-col items-center gap-3 ${match.status === 'finished' && match.player2Score > match.player1Score ? 'bg-green-50' : 'bg-slate-50'}`}>
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-slate-400 font-bold text-xl shadow-sm">
                        {match.player2Name.charAt(0)}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 truncate w-24">Atleta 2</p>
                        <p className={`text-sm font-black tracking-tight ${match.status === 'finished' && match.player2Score > match.player1Score ? 'text-green-600' : 'text-slate-900'}`}>
                          {match.player2Name}
                        </p>
                      </div>
                      {match.status === 'finished' && (
                        <div className="text-2xl font-black text-slate-900">{match.player2Score}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Torneios</h1>
        <p className="text-slate-500 font-medium font-mono uppercase text-[10px] sm:text-xs tracking-widest">Competições Oficiais da Escola</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-slate-200">
           <Trophy className="w-12 h-12 text-slate-200 mx-auto mb-4" />
           <p className="text-slate-400 font-medium">Nenhum torneio agendado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => setSelectedTournament(tournament)}
              className="bg-white rounded-[24px] sm:rounded-[32px] overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all group cursor-pointer"
            >
              <div className="h-40 sm:h-48 bg-slate-900 relative">
                <img 
                  src={`https://images.unsplash.com/photo-1646978567314-32cfd5a8854e?q=80&w=1555&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`} 
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" 
                  alt="" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <div className="absolute bottom-4 sm:bottom-6 left-6 sm:left-8">
                  {tournament.category && (
                    <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2 sm:mb-3 inline-block">
                      {tournament.category}
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">{tournament.name}</h3>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">{tournament.description || "Acompanhe os resultados e a tabela deste torneio oficial."}</p>
                
                <div className="flex items-center justify-between py-4 border-y border-slate-50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Início</p>
                      <p className="text-xs sm:text-sm font-bold">{format(new Date(tournament.startDate), "dd 'de' MMM", { locale: ptBR })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status</p>
                      <p className="text-xs sm:text-sm font-bold uppercase whitespace-nowrap">{
                        tournament.status === 'active' ? 'Ativo' : 
                        tournament.status === 'finished' ? 'Finalizado' : 'Aguardando'
                      }</p>
                    </div>
                  </div>
                </div>

                <div className="w-full flex items-center justify-center gap-2 bg-slate-50 group-hover:bg-orange-500 group-hover:text-white transition-all font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl text-slate-900 text-sm sm:text-base border border-slate-100 group-hover:border-orange-600">
                  Ver Resultados e Tabela
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

