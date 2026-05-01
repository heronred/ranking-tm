import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../services/db';
import { Match, UserProfile, Challenge, Tournament } from '../types';
import { 
  Trophy, 
  Target, 
  Zap, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [statsData, setStatsData] = useState<{ name: string; pts: number }[]>([]);
  const [nextTournament, setNextTournament] = useState<Tournament | null>(null);

  useEffect(() => {
    if (!profile) return;

    // Fetch user matches for recent results list
    const unsubMatches = dbService.getUserMatches(profile.uid, (matches) => {
      setRecentMatches(matches.filter(m => m.status === 'finished'));
    });

    const unsubChallenges = dbService.getChallenges(profile.uid, (challenges) => {
      setChallenges(challenges);
    });

    const unsubTournaments = dbService.getTournaments((tourneys) => {
      const scheduled = tourneys
        .filter(t => t.isActive !== false && t.status === 'scheduled')
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      
      setNextTournament(scheduled[0] || null);
    });

    // Fetch finished matches to calculate evolution
    const unsubHistory = dbService.getFinishedMatchesForUser(profile.uid, (matches) => {
      // Calculate evolution backwards from current points
      // Points config matches adminService.ts
      const POINTS = {
        tournamentWin: 30,
        tournamentLoss: 10,
        challengeWin: 15,
        challengeLoss: 5
      };

      let currentPts = profile.rankingPoints || 1000;
      const history = [{ name: 'Hoje', pts: currentPts }];
      
      // Sort matches descending by date to go backwards
      const sortedMatches = [...matches].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      sortedMatches.forEach((match, index) => {
        if (index >= 9) return; // Only show last 10 points

        const isWinner = match.winnerId === profile.uid;
        const isTournament = match.type === 'tournament';
        
        let pointDelta = 0;
        if (isTournament) {
          pointDelta = isWinner ? POINTS.tournamentWin : POINTS.tournamentLoss;
        } else {
          pointDelta = isWinner ? POINTS.challengeWin : POINTS.challengeLoss;
        }

        currentPts -= pointDelta;
        history.unshift({
          name: new Date(match.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          pts: currentPts
        });
      });

      // If no matches, add a starting point
      if (history.length === 1) {
        history.unshift({ name: 'Início', pts: currentPts });
      }

      setStatsData(history);
    });

    return () => {
      unsubMatches();
      unsubHistory();
      unsubChallenges();
      unsubTournaments();
    };
  }, [profile]);

  const cards = [
    { title: 'Pontuação', value: profile?.rankingPoints, icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { title: 'Sua Categoria', value: profile?.category, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: 'Desafios Pendentes', value: challenges.length, icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-10 relative">
      {!profile?.isApproved && profile?.role !== 'admin' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white p-10 rounded-[40px] shadow-2xl border border-slate-200 max-w-md w-full text-center space-y-6"
          >
            <div className="bg-orange-100 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-2">
              <Clock className="w-10 h-10 text-orange-500 animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Aguardando Aprovação</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Obrigado por se registrar! Sua conta está em análise. <br />
              Um administrador irá vincular seu perfil em breve.
            </p>
            <div className="pt-4">
               <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                 <motion.div 
                   className="h-full bg-orange-500"
                   animate={{ width: ["0%", "100%"] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                 />
               </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${card.bg} p-3 rounded-2xl`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <span className="text-slate-400 text-xs font-mono font-bold uppercase tracking-wider">Status Atual</span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="text-xl font-bold tracking-tight mb-6">Últimos Resultados</h3>
            <div className="space-y-4">
              {recentMatches.length === 0 ? (
                <div className="py-10 text-center text-slate-400">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">Nenhum jogo recente.</p>
                </div>
              ) : (
                recentMatches.map((match) => {
                  const isPlayer1 = match.player1Id === profile?.uid;
                  const opponentName = isPlayer1 ? match.player2Name : match.player1Name;
                  const isWinner = match.winnerId === profile?.uid;
                  
                  return (
                    <div key={match.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer group">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">{match.type === 'tournament' ? 'Torneio' : 'Desafio'}</span>
                          {isWinner ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-orange-400" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="font-bold text-slate-800 text-sm">vs {opponentName}</span>
                           <span className="font-mono font-black text-orange-500">
                             {isPlayer1 ? `${match.player1Score} - ${match.player2Score}` : `${match.player2Score} - ${match.player1Score}`}
                           </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-all" />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {nextTournament ? (
            <Link to="/tournaments" className="bg-orange-500 p-8 rounded-[32px] text-white overflow-hidden relative group cursor-pointer shadow-xl shadow-orange-500/20 block">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Próxima Competição</h3>
                <p className="text-orange-100 text-sm mb-6 opacity-90">{nextTournament.name}</p>
                <button className="bg-white text-orange-500 px-6 py-2 rounded-xl font-bold text-sm shadow-lg group-hover:px-8 transition-all">Ver Detalhes</button>
              </div>
              <Trophy className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </Link>
          ) : (
            <div className="bg-slate-800 p-8 rounded-[32px] text-white overflow-hidden relative group shadow-xl">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Sem Torneios</h3>
                <p className="text-slate-400 text-sm mb-6">Nenhuma competição agendada no momento.</p>
                <Link to="/tournaments" className="bg-white/10 text-white px-6 py-2 rounded-xl font-bold text-sm border border-white/10 hover:bg-white/20 transition-all inline-block">Ver Torneios</Link>
              </div>
              <Target className="absolute right-[-20px] bottom-[-20px] w-40 h-40 text-white/5 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
