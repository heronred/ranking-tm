import React, { useState, useEffect, useRef } from 'react';
import { adminService, AppSettings } from '../services/admin';
import { dbService } from '../services/db';
import { Category, TournamentStatus, Tournament, UserProfile, Match, Athlete, PointsLog } from '../types';
import { Plus, Trophy, Swords, Settings, Save, Loader2, Users, Target, ShieldCheck, CheckCircle2, Trash2, Link as LinkIcon, UserPlus, X, Clock, Upload, FileJson, ArrowLeft, History, Edit3, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { useAuth } from '../context/AuthContext';

type Tab = 'tournaments' | 'results' | 'athletes' | 'settings' | 'logs';

// --- SUB-COMPONENTS ---
const TournamentManagement: React.FC<{
  tournament: Tournament;
  matches: Match[];
  players: UserProfile[];
  onBack: () => void;
  onDeleteMatch: (id: string) => void;
  onRegisterResult: (match: Match) => void;
}> = ({ tournament, matches, players, onBack, onDeleteMatch, onRegisterResult }) => {
  const [matchData, setMatchData] = useState({
    player1Id: '',
    player2Id: '',
    time: '12:00'
  });
  const [loading, setLoading] = useState(false);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchData.player1Id || !matchData.player2Id) return;
    setLoading(true);

    const p1 = players.find(p => p.uid === matchData.player1Id);
    const p2 = players.find(p => p.uid === matchData.player2Id);

    // Combine tournament date part with input time
    const tourneyDate = new Date(tournament.startDate);
    const [hours, minutes] = matchData.time.split(':').map(Number);
    const matchDate = new Date(tourneyDate);
    matchDate.setHours(hours, minutes, 0, 0);

    await adminService.createMatch({
      player1Id: matchData.player1Id,
      player2Id: matchData.player2Id,
      player1Name: p1?.nickname || p1?.displayName || 'Jogador 1',
      player2Name: p2?.nickname || p2?.displayName || 'Jogador 2',
      player1Score: 0,
      player2Score: 0,
      status: 'scheduled',
      tournamentId: tournament.id,
      type: 'tournament',
      category: p1?.category || 'Não federados',
      date: matchDate.toISOString()
    });

    setLoading(true); // Keep loading state until finish
    setMatchData({ ...matchData, player1Id: '', player2Id: '' });
    setLoading(false);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{tournament.name}</h2>
            <p className="text-sm text-slate-500 font-medium">Gerenciamento de chaves e partidas do torneio.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest border border-blue-200">
             {matches.length} Partidas
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Match Form */}
        <section className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl space-y-6">
          <h3 className="text-lg font-black flex items-center gap-3">
            <Plus className="w-5 h-5 text-orange-500" /> Nova Partida
          </h3>
          
          <form onSubmit={handleAddMatch} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Atleta 1</label>
              <select 
                required
                value={matchData.player1Id}
                onChange={e => setMatchData({...matchData, player1Id: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="" className="bg-slate-900">Selecionar...</option>
                {players.filter(p => p.isApproved).map(p => (
                  <option key={p.uid} value={p.uid} className="bg-slate-900">{p.nickname || p.displayName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Atleta 2</label>
              <select 
                required
                value={matchData.player2Id}
                onChange={e => setMatchData({...matchData, player2Id: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="" className="bg-slate-900">Selecionar...</option>
                {players.filter(p => p.isApproved).map(p => (
                  <option key={p.uid} value={p.uid} className="bg-slate-900">{p.nickname || p.displayName}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Hora prevista para o jogo</label>
              <input 
                type="time"
                value={matchData.time}
                onChange={e => setMatchData({...matchData, time: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <p className="text-[9px] text-slate-500 ml-1 italic">Data: {new Intl.DateTimeFormat('pt-BR').format(new Date(tournament.startDate))}</p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Adicionar Partida
            </button>
          </form>
        </section>

        {/* Matches List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map(match => (
              <div key={match.id} className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm relative group">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${match.status === 'finished' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {match.status === 'finished' ? 'Finalizado' : 'Agendado'}
                  </span>
                  <div className="flex items-center gap-2">
                    {match.status !== 'finished' && (
                      <button 
                        onClick={() => onRegisterResult(match)}
                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                        title="Lançar Resultado"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => onDeleteMatch(match.id!)}
                      className="p-1.5 text-slate-300 hover:text-red-500 transition-all"
                      title="Excluir Partida"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="font-bold text-xs text-center">{match.player1Name}</span>
                    {match.status === 'finished' && <span className="text-2xl font-black text-slate-900">{match.player1Score}</span>}
                  </div>
                  <div className="text-xs font-black text-slate-300 italic">VS</div>
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <span className="font-bold text-xs text-center">{match.player2Name}</span>
                    {match.status === 'finished' && <span className="text-2xl font-black text-slate-900">{match.player2Score}</span>}
                  </div>
                </div>

                {match.date && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(match.date))}</span>
                  </div>
                )}
              </div>
            ))}
            {matches.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
                Ainda não há partidas cadastradas para esta competição.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Admin: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('tournaments');
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [resultsFilter, setResultsFilter] = useState({
    tournamentId: 'all',
    type: 'all',
    search: ''
  });
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [pendingMatches, setPendingMatches] = useState<Match[]>([]);
  const [tournamentMatches, setTournamentMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<UserProfile[]>([]);
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [editingNick, setEditingNick] = useState<{uid: string, value: string} | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    tournamentWin: 100,
    tournamentLoss: 10,
    challengeWin: 50,
    challengeLoss: 5
  });
  const [loading, setLoading] = useState(false);
  
  // New Athlete Form
  const [newAthlete, setNewAthlete] = useState({
    name: '',
    category: 'Não federados' as Category,
    linkedEmail: ''
  });

  // Selected Match for Result Recording
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [scores, setScores] = useState({ p1: 0, p2: 0 });

  // Linking state
  const [linkingAthlete, setLinkingAthlete] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  const [confirmDeleteTourneyId, setConfirmDeleteTourneyId] = useState<string | null>(null);
  const [confirmTruncate, setConfirmTruncate] = useState(false);
  const [confirmProductionReset, setConfirmProductionReset] = useState(false);
  const [confirmResetUsers, setConfirmResetUsers] = useState(false);

  // Manual Adjustment State
  const [logs, setLogs] = useState<PointsLog[]>([]);
  const [adjustingPoints, setAdjustingPoints] = useState<{
    uid: string;
    name: string;
    currentPoints: number;
  } | null>(null);
  const [manualPointsForm, setManualPointsForm] = useState({ pts: 0, reason: '' });

  const [searchTerm, setSearchTerm] = useState('');
  const [logFilter, setLogFilter] = useState('');

  const filteredAthletes = athletes.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPlayers = players.filter(p => 
    (p.nickname || p.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = logs.filter(l => 
    l.targetName.toLowerCase().includes(logFilter.toLowerCase()) ||
    l.adminName.toLowerCase().includes(logFilter.toLowerCase())
  );

  const selectablePlayers = [
    ...players.filter(p => !p.role.includes('admin') && p.isApproved),
    ...athletes.filter(a => !a.linkedUserId).map(a => ({
      uid: `athlete_${a.id}`,
      displayName: a.name,
      nickname: a.name,
      rankingPoints: a.rankingPoints || 0,
      category: a.category,
      role: 'player'
    } as UserProfile))
  ].sort((a, b) => (a.nickname || a.displayName).localeCompare(b.nickname || b.displayName));

  const showNotify = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type });
    // Reset after 4 seconds
    setTimeout(() => setNotification(null), 4000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as any[];
        if (rows.length === 0) return;

        setLoading(true);
        let importedCount = 0;
        let errors = 0;

        for (const row of rows) {
          // Expected cols: Atleta 1, Atleta 2, Competição (opcional)
          const name1 = row['Atleta 1'] || row['atleta 1'];
          const name2 = row['Atleta 2'] || row['atleta 2'];
          const tournamentName = row['Competição'] || row['competição'];

          const p1 = players.find(p => 
            p.displayName.toLowerCase() === name1?.toLowerCase() || 
            p.nickname?.toLowerCase() === name1?.toLowerCase()
          );
          const p2 = players.find(p => 
            p.displayName.toLowerCase() === name2?.toLowerCase() || 
            p.nickname?.toLowerCase() === name2?.toLowerCase()
          );

          const tournament = tournaments.find(t => t.name.toLowerCase() === tournamentName?.toLowerCase());

          if (p1 && p2) {
            await adminService.createMatch({
              player1Id: p1.uid,
              player2Id: p2.uid,
              player1Name: p1.nickname || p1.displayName,
              player2Name: p2.nickname || p2.displayName,
              player1Score: 0,
              player2Score: 0,
              status: 'scheduled',
              tournamentId: tournament?.id || undefined,
              type: tournament ? 'tournament' : 'challenge',
              category: p1.category || 'Não federados',
              date: new Date().toISOString()
            });
            importedCount++;
          } else {
            console.warn(`Jogadores não encontrados: ${name1} ou ${name2}`);
            errors++;
          }
        }

        setLoading(false);
        showNotify(`${importedCount} partidas importadas com sucesso! ${errors > 0 ? `${errors} ignoradas.` : ''}`);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    });
  };

  // New Match Form
  const [newMatch, setNewMatch] = useState({
    player1Id: '',
    player2Id: '',
    tournamentId: '',
  });

  // New Tournament Form
  const [newTourney, setNewTourney] = useState<{
    name: string;
    description: string;
    startDate: string;
    status: TournamentStatus;
    isActive: boolean;
    category?: Category;
  }>({
    name: '',
    description: '',
    startDate: '',
    status: 'scheduled' as TournamentStatus,
    isActive: true
  });

  const fetchData = async () => {
    const allPlayers = await adminService.getAllPlayers();
    setPlayers(allPlayers);
    const allAthletes = await adminService.getAthletes();
    setAthletes(allAthletes);
    const appSettings = await adminService.getSettings();
    setSettings(appSettings);
    if (activeTab === 'logs') {
      const allLogs = await adminService.getPointsLogs();
      setLogs(allLogs);
    }
  };

  const handleResetUsers = async () => {
    try {
      setLoading(true);
      await adminService.resetNonAdminUsers(['heronred@gmail.com', 'nikkeicuritibatenisdemesa@gmail.com']);
      showNotify('Usuários resetados com sucesso (Exceto Admins).');
      await fetchData();
    } catch (err) {
      console.error(err);
      showNotify('Erro ao resetar usuários.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminEmail = profile?.email === 'heronred@gmail.com' || profile?.email === 'nikkeicuritibatenisdemesa@gmail.com';
    if (urlParams.get('total_wipe') === '1' && isAdminEmail) {
      handleProductionReset();
    }
    if (urlParams.get('reset_users') === '1' && isAdminEmail) {
      handleResetUsers();
    }
  }, [profile]);

  useEffect(() => {
    const unsubTourneys = dbService.getTournaments(setTournaments);
    const unsubPending = dbService.getPendingMatches(setPendingMatches);
    
    fetchData();
    return () => {
      unsubTourneys();
      unsubPending();
    };
  }, []);

  useEffect(() => {
    if (activeTab === 'logs' || activeTab === 'athletes') {
      fetchData();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTournamentId) {
      const unsub = dbService.getTournamentMatches(activeTournamentId, setTournamentMatches);
      return () => unsub();
    } else {
      setTournamentMatches([]);
    }
  }, [activeTournamentId]);

  const handleCreateAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await adminService.createAthlete({
      name: newAthlete.name,
      category: newAthlete.category,
      linkedEmail: newAthlete.linkedEmail || undefined,
      rankingPoints: 0
    });
    setLoading(false);
    setNewAthlete({ name: '', category: 'Não federados', linkedEmail: '' });
    await fetchData();
  };

  const handleDeleteAthlete = async (id: string) => {
    try {
      setLoading(true);
      await adminService.deleteAthlete(id);
      await fetchData();
      showNotify('Atleta excluído com sucesso!');
    } catch (err) {
      console.error(err);
      showNotify('Erro ao excluir atleta.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkUser = async (uid: string, athleteId: string) => {
    try {
      setLoading(true);
      await adminService.linkUserToAthlete(uid, athleteId);
      setLinkingAthlete(null);
      await fetchData();
      showNotify('Usuário vinculado com sucesso!');
    } catch (err) {
      console.error(err);
      showNotify('Erro ao vincular usuário.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await adminService.createTournament(newTourney);
    setLoading(false);
    setNewTourney({ name: '', description: '', startDate: '', status: 'scheduled' });
    showNotify('Torneio criado com sucesso!');
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    await adminService.updateSettings(settings);
    setLoading(false);
    showNotify('Configurações salvas!');
  };

  const handleUpdatePlayerCategory = async (uid: string, category: Category) => {
    await adminService.updatePlayerCategory(uid, category);
    setPlayers(prev => prev.map(p => p.uid === uid ? { ...p, category } : p));
  };

  const handleToggleApproval = async (uid: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await adminService.updateUserApproval(uid, newStatus);
    setPlayers(prev => prev.map(p => p.uid === uid ? { ...p, isApproved: newStatus } : p));
  };

  const handleSaveNickname = async (uid: string) => {
    if (!editingNick || editingNick.uid !== uid) return;
    await adminService.updateUserNickname(uid, editingNick.value);
    setPlayers(prev => prev.map(p => p.uid === uid ? { ...p, nickname: editingNick.value } : p));
    setEditingNick(null);
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch.player1Id || !newMatch.player2Id) return;
    if (newMatch.player1Id === newMatch.player2Id) {
      showNotify('Selecione jogadores diferentes!', 'warning');
      return;
    }

    setLoading(true);
    const p1 = selectablePlayers.find(p => p.uid === newMatch.player1Id);
    const p2 = selectablePlayers.find(p => p.uid === newMatch.player2Id);

    await adminService.createMatch({
      player1Id: newMatch.player1Id,
      player2Id: newMatch.player2Id,
      player1Name: p1?.nickname || p1?.displayName || 'Jogador 1',
      player2Name: p2?.nickname || p2?.displayName || 'Jogador 2',
      player1Score: 0,
      player2Score: 0,
      status: 'scheduled',
      tournamentId: newMatch.tournamentId || undefined,
      type: (newMatch.tournamentId && newMatch.tournamentId !== '') ? 'tournament' : 'challenge',
      category: p1?.category || 'Não federados',
      date: new Date().toISOString()
    });

    setLoading(false);
    setNewMatch({ player1Id: '', player2Id: '', tournamentId: '' });
    showNotify('Partida adicionada à tabela de jogos!');
  };

  const handleRegisterResult = async () => {
    if (!selectedMatch) return;
    try {
      setLoading(true);
      const winnerId = scores.p1 > scores.p2 ? selectedMatch.player1Id! : selectedMatch.player2Id!;
      await adminService.updateMatchResult(selectedMatch.id!, scores.p1, scores.p2, winnerId);
      setSelectedMatch(null);
      setScores({ p1: 0, p2: 0 });
      showNotify('Resultado registrado com sucesso!');
    } catch (err) {
      console.error(err);
      showNotify('Erro ao registrar resultado.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTournamentStatus = async (id: string, status: TournamentStatus) => {
    await adminService.updateTournamentStatus(id, status);
  };

  const handleToggleTournamentActive = async (id: string, isActive: boolean) => {
    await adminService.updateTournamentActive(id, isActive);
  };

  const handleDeleteTournament = async (id: string | undefined) => {
    if (!id) return;
    try {
      setLoading(true);
      await adminService.deleteTournament(id);
      showNotify('Torneio excluído com sucesso!');
      setConfirmDeleteTourneyId(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      let msg = 'Erro ao excluir torneio.';
      if (typeof err.message === 'string') {
        if (err.message.includes('permission-denied')) {
          msg = 'Erro de permissão no Firebase.';
        } else if (err.message.includes('Não é possível excluir')) {
          msg = err.message;
        }
      }
      showNotify(msg, 'error');
      setConfirmDeleteTourneyId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (id: string) => {
    try {
      setLoading(true);
      await adminService.deleteMatch(id);
      showNotify('Partida excluída com sucesso!');
    } catch (err) {
      console.error(err);
      showNotify('Erro ao excluir partida.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleTruncateMatches = async () => {
    try {
      setLoading(true);
      await adminService.truncateMatches();
      showNotify('Todos os jogos foram removidos.');
      setConfirmTruncate(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      showNotify('Erro ao excluir jogos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleProductionReset = async () => {
    try {
      setLoading(true);
      await adminService.fullProductionWipe();
      showNotify('WIPE TOTAL realizado com sucesso! Pronto para produção.');
      setConfirmProductionReset(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      showNotify('Erro ao realizar wipe de produção.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAdjustment = async () => {
    if (!adjustingPoints || !profile) return;
    try {
      setLoading(true);
      await adminService.manualPointsAdjustment(
        adjustingPoints.uid,
        manualPointsForm.pts,
        manualPointsForm.reason || 'Ajuste manual pela administração',
        profile.uid,
        profile.nickname || profile.displayName
      );
      showNotify(`Pontos de ${adjustingPoints.name} atualizados!`);
      setAdjustingPoints(null);
      setManualPointsForm({ pts: 0, reason: '' });
      await fetchData();
    } catch (err) {
      console.error(err);
      showNotify('Erro ao ajustar pontos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'tournaments', label: 'Competições', icon: Trophy },
    { id: 'results', label: 'Resultados', icon: Swords },
    { id: 'athletes', label: 'Atletas', icon: Users },
    { id: 'logs', label: 'Histórico', icon: History },
    { id: 'settings', label: 'Sistema', icon: Target },
  ];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="bg-slate-900 p-3 rounded-2xl shadow-xl shadow-slate-900/10">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-1">Painel Admin</h1>
            <p className="text-slate-500 font-medium font-mono uppercase text-xs tracking-widest flex items-center gap-2">
               <ShieldCheck className="w-3 h-3 text-orange-500" /> Acesso de Administrador
            </p>
          </div>
        </div>

        <div>
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" 
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-orange-500' : ''}`} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>

      {/* Manual Point Adjustment Modal/Panel */}
      <AnimatePresence>
        {adjustingPoints && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdjustingPoints(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[40px] shadow-2xl p-8 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Ajuste de Pontos</h3>
                  <p className="text-sm text-slate-500 font-medium">Alterando pontuação de <span className="text-blue-600">{adjustingPoints.name}</span></p>
                </div>
                <button onClick={() => setAdjustingPoints(null)} className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                  <X />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Pontos Atuais</p>
                      <p className="text-2xl font-black text-slate-400">{adjustingPoints.currentPoints}</p>
                   </div>
                   <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[9px] font-black uppercase text-blue-400 tracking-widest mb-1">Novos Pontos</p>
                      <input 
                        type="number"
                        value={manualPointsForm.pts}
                        onChange={e => setManualPointsForm({...manualPointsForm, pts: parseInt(e.target.value) || 0})}
                        className="text-2xl font-black text-blue-600 bg-transparent w-full outline-none"
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Motivo da Alteração</label>
                   <textarea 
                     value={manualPointsForm.reason}
                     onChange={e => setManualPointsForm({...manualPointsForm, reason: e.target.value})}
                     placeholder="Ex: Correção de erro na súmula da final..."
                     className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium h-24"
                   />
                </div>

                <button 
                  onClick={handleManualAdjustment}
                  disabled={loading}
                  className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                  Confirmar Alteração
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === 'tournaments' && (
          <motion.div 
            key="tournaments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            {activeTournamentId ? (
              <TournamentManagement 
                tournament={tournaments.find(t => t.id === activeTournamentId)!}
                matches={tournamentMatches}
                players={players}
                onBack={() => setActiveTournamentId(null)}
                onDeleteMatch={handleDeleteMatch}
                onRegisterResult={(match) => {
                  setSelectedMatch(match);
                  setScores({ p1: 0, p2: 0 });
                  setActiveTab('results');
                }}
              />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Create Tournament */}
                <section className="bg-white p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-xl space-y-6 sm:y-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-500/10 p-2 rounded-xl">
                      <Plus className="w-6 h-6 text-orange-500" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Novo Torneio</h2>
                  </div>

                  <form onSubmit={handleCreateTournament} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Nome do Evento</label>
                      <input 
                        required
                        type="text" 
                        value={newTourney.name}
                        onChange={e => setNewTourney({...newTourney, name: e.target.value})}
                        placeholder="Ex: Open Itapeva de Tênis de Mesa"
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Data de Início</label>
                        <input 
                          required
                          type="datetime-local" 
                          value={newTourney.startDate}
                          onChange={e => setNewTourney({...newTourney, startDate: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Descrição</label>
                      <textarea 
                        rows={3}
                        value={newTourney.description}
                        onChange={e => setNewTourney({...newTourney, description: e.target.value})}
                        placeholder="Regras, prêmios e informações adicionais..."
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 transition-all font-medium"
                      />
                    </div>

                    <button 
                      disabled={loading}
                      className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95"
                    >
                      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                      Publicar Torneio
                    </button>
                  </form>
                </section>

                {/* List Tournaments */}
                <section className="bg-slate-900 p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                  <div className="relative z-10 space-y-6 sm:space-y-8">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-6 h-6 text-orange-500" />
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Torneios Ativos</h2>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {tournaments.map(t => (
                        <div key={t.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {t.category && <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 block">{t.category}</span>}
                              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                t.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                                t.status === 'ongoing' ? 'bg-emerald-500/20 text-emerald-400 animate-pulse' :
                                'bg-slate-500/20 text-slate-400'
                              }`}>
                                {t.status === 'scheduled' ? 'Agendado' : t.status === 'ongoing' ? 'Em Andamento' : 'Finalizado'}
                              </span>
                            </div>
                            <h4 className="font-bold text-lg">{t.name}</h4>
                            <p className="text-xs text-slate-400 font-medium">Início: {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(t.startDate))}</p>
                            
                            <button 
                              onClick={() => setActiveTournamentId(t.id!)}
                              className="mt-4 px-4 py-2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                            >
                              Gerenciar Partidas
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => handleToggleTournamentActive(t.id, !t.isActive)}
                                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${
                                    t.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500 border border-white/5'
                                  }`}
                                >
                                  {t.isActive ? 'On' : 'Off'}
                                </button>
                                <select 
                                  value={t.status}
                                  onChange={(e) => handleUpdateTournamentStatus(t.id, e.target.value as TournamentStatus)}
                                  className="bg-slate-800 text-[10px] font-black uppercase border border-white/10 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-orange-500 outline-none cursor-pointer"
                                >
                                  <option value="scheduled">Agendado</option>
                                  <option value="ongoing">Iniciado</option>
                                  <option value="finished">Finalizado</option>
                                </select>
                              </div>
                              
                              {t.status !== 'ongoing' && (
                                confirmDeleteTourneyId === t.id ? (
                                  <div className="flex gap-1">
                                    <button 
                                      onClick={() => handleDeleteTournament(t.id)}
                                      disabled={loading}
                                      className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-[9px] font-black uppercase animate-pulse"
                                    >
                                      Confirmar?
                                    </button>
                                    <button 
                                      onClick={() => setConfirmDeleteTourneyId(null)}
                                      className="p-1.5 bg-slate-700 text-white rounded-lg"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setConfirmDeleteTourneyId(t.id || null)}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 group/del"
                                    title="Excluir Torneio"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Excluir</span>
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {tournaments.length === 0 && (
                        <div className="py-10 text-center flex flex-col items-center gap-4 text-slate-500">
                           <Trophy className="w-12 h-12 opacity-20" />
                           <p className="font-medium">Nenhum torneio agendado.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute right-[-40px] top-[-40px] w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />
                </section>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col lg:flex-row gap-8"
          >
            <div className="flex-1 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Tabela de Jogos</h2>
                  <p className="text-sm text-slate-500 font-medium">Lançamento e exclusão de resultados.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleCSVImport} 
                    accept=".csv" 
                    className="hidden" 
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    CSV
                  </button>
                  
                  {confirmTruncate ? (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={handleTruncateMatches}
                        className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase animate-pulse"
                      >
                        Confirmar Faxina?
                      </button>
                      <button onClick={() => setConfirmTruncate(false)} className="p-2 text-slate-400"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmTruncate(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 rounded-xl text-xs font-bold text-red-600 hover:bg-red-100 transition-all shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Limpar Tudo
                    </button>
                  )}
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-orange-200">
                    {pendingMatches.length} Pendentes
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-white p-4 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Tipo</label>
                  <select 
                    value={resultsFilter.type}
                    onChange={e => setResultsFilter({...resultsFilter, type: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="all">Ver Tudo</option>
                    <option value="tournament">Torneios</option>
                    <option value="challenge">Desafios</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Torneio</label>
                  <select 
                    value={resultsFilter.tournamentId}
                    onChange={e => setResultsFilter({...resultsFilter, tournamentId: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="all">Qualquer um</option>
                    {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-1">Buscar</label>
                  <input 
                    type="text"
                    placeholder="Nome..."
                    value={resultsFilter.search}
                    onChange={e => setResultsFilter({...resultsFilter, search: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl px-3 py-2 text-[11px] font-bold focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Jogo</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest hidden md:table-cell">Evento</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest hidden sm:table-cell">Categoria</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pendingMatches
                        .filter(m => {
                          const typeMatch = resultsFilter.type === 'all' || m.type === resultsFilter.type;
                          const tourneyMatch = resultsFilter.tournamentId === 'all' || m.tournamentId === resultsFilter.tournamentId;
                          const searchMatch = !resultsFilter.search || 
                            m.player1Name.toLowerCase().includes(resultsFilter.search.toLowerCase()) ||
                            m.player2Name.toLowerCase().includes(resultsFilter.search.toLowerCase());
                          return typeMatch && tourneyMatch && searchMatch;
                        })
                        .map(match => (
                          <tr 
                            key={match.id}
                            className={`group transition-colors ${selectedMatch?.id === match.id ? 'bg-orange-50/50' : 'hover:bg-slate-50'}`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">{match.player1Name}</span>
                                <span className="text-[10px] font-black text-slate-300 italic">VS</span>
                                <span className="font-bold text-sm text-slate-900">{match.player2Name}</span>
                              </div>
                              <div className="md:hidden mt-1 flex gap-2">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                  {match.type === 'tournament' ? 'Torneio' : 'Desafio'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                 match.type === 'tournament' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                               }`}>
                                 {match.type === 'tournament' 
                                   ? tournaments.find(t => t.id === match.tournamentId)?.name || 'Torneio' 
                                   : 'Desafio'}
                               </span>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{match.category}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    setScores({ p1: 0, p2: 0 });
                                  }}
                                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                    selectedMatch?.id === match.id 
                                      ? 'bg-orange-500 text-white shadow-lg' 
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                >
                                  Resultados
                                </button>
                                <button 
                                  onClick={() => handleDeleteMatch(match.id!)}
                                  className="p-2 text-slate-300 hover:text-red-500 transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                      {pendingMatches.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                            Nenhum jogo pendente encontrado.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[400px] space-y-6">
               {/* Registrar Resultado Panel */}
               <div className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-xl space-y-6 sticky top-6">
                 <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                   <Target className="w-5 h-5 text-orange-500" /> Registrar Pontuação
                 </h3>
                 
                 {selectedMatch ? (
                   <div className="space-y-6">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2">{selectedMatch.type === 'tournament' ? 'Competição' : 'Desafio'}</span>
                         <button onClick={() => setSelectedMatch(null)} className="text-slate-400 hover:text-slate-900"><X className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-4">
                         <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">{selectedMatch.player1Name}</p>
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => setScores(s => ({...s, p1: Math.max(0, s.p1 - 1)}))}
                                 className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-slate-200"
                               >-</button>
                               <input 
                                 type="number" 
                                 value={scores.p1} 
                                 onChange={e => setScores(s => ({...s, p1: parseInt(e.target.value) || 0}))}
                                 className="w-full h-12 bg-slate-900 text-white text-center font-black rounded-xl text-xl"
                               />
                               <button 
                                 onClick={() => setScores(s => ({...s, p1: s.p1 + 1}))}
                                 className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-slate-200"
                               >+</button>
                            </div>
                         </div>

                         <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">{selectedMatch.player2Name}</p>
                            <div className="flex items-center gap-2">
                               <button 
                                 onClick={() => setScores(s => ({...s, p2: Math.max(0, s.p2 - 1)}))}
                                 className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-slate-200"
                               >-</button>
                               <input 
                                 type="number" 
                                 value={scores.p2} 
                                 onChange={e => setScores(s => ({...s, p2: parseInt(e.target.value) || 0}))}
                                 className="w-full h-12 bg-slate-900 text-white text-center font-black rounded-xl text-xl"
                               />
                               <button 
                                 onClick={() => setScores(s => ({...s, p2: s.p2 + 1}))}
                                 className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl hover:bg-slate-200"
                               >+</button>
                            </div>
                         </div>
                      </div>

                      <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                         <span className="text-[9px] font-black uppercase text-orange-400 tracking-widest block mb-1">Vencedor</span>
                         <span className="font-black text-orange-600 uppercase text-base">
                            {scores.p1 === scores.p2 ? 'Empate não permitido' : scores.p1 > scores.p2 ? selectedMatch.player1Name : selectedMatch.player2Name}
                         </span>
                      </div>

                      <button 
                        disabled={loading || scores.p1 === scores.p2}
                        onClick={handleRegisterResult}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-orange-500 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                         {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                         Salvar Resultado
                      </button>
                   </div>
                 ) : (
                   <div className="py-10 text-center space-y-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <Swords className="w-6 h-6 text-slate-200" />
                      </div>
                      <p className="text-slate-400 text-xs font-medium px-4">Selecione uma partida na lista ao lado para registrar os pontos.</p>
                   </div>
                 )}
               </div>

               {/* Create Match Form */}
               <section className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl space-y-6">
                 <h3 className="text-lg font-black flex items-center gap-3">
                   <Plus className="w-5 h-5 text-orange-500" /> Agendar Jogo
                 </h3>
                 
                 <form onSubmit={handleCreateMatch} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Tipo de Partida</label>
                       <select 
                         value={newMatch.tournamentId}
                         onChange={e => setNewMatch({...newMatch, tournamentId: e.target.value})}
                         className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                       >
                         <option value="" className="bg-slate-900 text-orange-400">🔥 Desafio Técnico</option>
                         <optgroup label="Torneios Ativos" className="bg-slate-900 text-slate-500">
                           {tournaments.filter(t => t.status !== 'finished').map(t => (
                             <option key={t.id} value={t.id} className="bg-slate-900 text-white">{t.name}</option>
                           ))}
                         </optgroup>
                       </select>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Atleta 1</label>
                          <select 
                            required
                            value={newMatch.player1Id}
                            onChange={e => setNewMatch({...newMatch, player1Id: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                          >
                            <option value="" className="bg-slate-900">Selecionar...</option>
                            {selectablePlayers.map(p => (
                              <option key={p.uid} value={p.uid} className="bg-slate-900">{p.nickname || p.displayName}</option>
                            ))}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Atleta 2</label>
                          <select 
                            required
                            value={newMatch.player2Id}
                            onChange={e => setNewMatch({...newMatch, player2Id: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                          >
                            <option value="" className="bg-slate-900">Selecionar...</option>
                            {selectablePlayers.map(p => (
                              <option key={p.uid} value={p.uid} className="bg-slate-900">{p.nickname || p.displayName}</option>
                            ))}
                          </select>
                       </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-orange-500 text-white font-black py-4 rounded-2xl hover:bg-orange-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                       {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                       Adicionar Jogo
                    </button>
                 </form>
               </section>
            </div>
          </motion.div>
        )}

        {activeTab === 'athletes' && (
          <motion.div 
            key="athletes"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Pre-register Athlete Form */}
              <div className="lg:col-span-1 space-y-6">
                <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-500/10 p-2 rounded-xl">
                      <UserPlus className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">Pré-cadastro</h2>
                  </div>
                  
                  <p className="text-sm text-slate-500 font-medium">Cadastre o atleta antes mesmo dele baixar o app.</p>

                  <form onSubmit={handleCreateAthlete} className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Nome Completo</label>
                       <input 
                         required
                         type="text"
                         value={newAthlete.name}
                         onChange={e => setNewAthlete({...newAthlete, name: e.target.value})}
                         placeholder="Ex: Arthur Mauricio"
                         className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 transition-all font-medium text-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Categoria</label>
                       <select 
                         value={newAthlete.category}
                         onChange={e => setNewAthlete({...newAthlete, category: e.target.value as Category})}
                         className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 transition-all font-medium text-sm"
                       >
                         <option>Federados</option>
                         <option>Não federados</option>
                         <option>Sub 11</option>
                         <option>60+</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">E-mail (Opcional p/ auto-vínculo)</label>
                       <input 
                         type="email"
                         value={newAthlete.linkedEmail}
                         onChange={e => setNewAthlete({...newAthlete, linkedEmail: e.target.value})}
                         placeholder="atleta@gmail.com"
                         className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 transition-all font-medium text-sm"
                       />
                    </div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-emerald-500 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                      Salvar Atleta
                    </button>
                  </form>
                </section>
              </div>

              {/* Athletes and Unlinked Users List */}
              <div className="lg:col-span-2 space-y-10">
                {/* Pre-registered Athletes List */}
                <section className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-500" /> Atletas Pré-cadastrados
                    </h3>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <input 
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs focus:ring-2 focus:ring-orange-500 outline-none w-48 shadow-inner"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredAthletes.map(a => (
                      <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{a.name}</p>
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{a.category}</p>
                          {a.linkedUserId ? (
                            <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full mt-1">
                              <ShieldCheck className="w-2 h-2" /> Vinculado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full mt-1">
                              <Clock className="w-2 h-2" /> Pendente
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {!a.linkedUserId && (
                            <button 
                              onClick={() => setLinkingAthlete(a.id)}
                              className="p-2 bg-white text-orange-500 rounded-lg shadow-sm border border-orange-100 hover:bg-orange-500 hover:text-white transition-all"
                              title="Vincular a um usuário"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setAdjustingPoints({
                                uid: a.linkedUserId || `athlete_${a.id}`,
                                name: a.name,
                                currentPoints: a.rankingPoints
                              });
                              setManualPointsForm({ pts: a.rankingPoints, reason: '' });
                            }}
                            className="p-2 bg-white text-blue-500 rounded-lg shadow-sm border border-blue-100 hover:bg-blue-500 hover:text-white transition-all"
                            title="Ajustar Pontos"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteAthlete(a.id)}
                            className="p-2 bg-white text-slate-300 rounded-lg hover:text-red-500 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {athletes.length === 0 && (
                      <div className="col-span-full py-8 text-center text-slate-400 italic text-sm">
                        Nenhum atleta pré-cadastrado.
                      </div>
                    )}
                  </div>
                </section>

                {/* Linking UI / Unlinked Users */}
                {linkingAthlete && (
                  <motion.section 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-orange-50 p-8 rounded-[32px] border-2 border-orange-200 shadow-xl space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-orange-900">Vincular Usuário</h3>
                      <button onClick={() => setLinkingAthlete(null)} className="text-orange-900/50 hover:text-orange-900"><X /></button>
                    </div>
                    <p className="text-sm text-orange-800">
                      Selecione o usuário que corresponde ao atleta <span className="font-bold underline">{athletes.find(a => a.id === linkingAthlete)?.name}</span>.
                    </p>
                    <div className="space-y-3">
                      {players.filter(p => !p.athleteId && p.role !== 'admin').map(p => (
                        <div key={p.uid} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-orange-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center font-bold">
                              {p.displayName.charAt(0)}
                            </div>
                            <div>
                               <p className="font-bold text-slate-900">{p.displayName}</p>
                               <p className="text-xs text-slate-500 leading-none">{p.email}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleLinkUser(p.uid, linkingAthlete)}
                            className="px-4 py-2 bg-orange-500 text-white text-xs font-black uppercase rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-95"
                          >
                            Confirmar Vínculo
                          </button>
                        </div>
                      ))}
                      {players.filter(p => !p.athleteId && p.role !== 'admin').length === 0 && (
                         <div className="py-4 text-center text-orange-400 italic text-sm">
                           Nenhum usuário aguardando vínculo no momento.
                         </div>
                      )}
                    </div>
                  </motion.section>
                )}
              </div>
            </div>

            {/* Registered Users Table */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden">
               <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Usuários Registrados</h3>
                    <p className="text-sm text-slate-500 font-medium">Todos os perfis que já logaram no app.</p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      type="text"
                      placeholder="Buscar por nome ou e-mail..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
                    />
                  </div>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full">
                   <thead>
                     <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] border-b">
                       <th className="px-10 py-6 text-left">Atleta / Status</th>
                       <th className="px-10 py-6 text-left">Categoria</th>
                       <th className="px-10 py-6 text-center">Permissões</th>
                       <th className="px-10 py-6 text-center">Ações</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {filteredPlayers.map(player => (
                       <tr key={player.uid} className="hover:bg-slate-50 transition-all">
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-slate-200 flex items-center justify-center font-black text-slate-500 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                  {player.photoURL ? <img src={player.photoURL} alt="" /> : player.displayName.charAt(0)}
                               </div>
                               <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{player.nickname || player.displayName}</span>
                                    {player.athleteId ? (
                                      <span className="bg-emerald-100 text-emerald-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Vinculado</span>
                                    ) : (
                                      <span className="bg-orange-100 text-orange-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-md">Sem Vínculo</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-400 font-medium">{player.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-10 py-6">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase">
                              {player.category}
                            </span>
                         </td>
                         <td className="px-10 py-6 text-center">
                            <button
                               onClick={async () => {
                                 const newRole = player.role === 'admin' ? 'player' : 'admin';
                                 await adminService.updateUserRole(player.uid, newRole);
                                 fetchData();
                                 showNotify(`Permissão de ${player.displayName} alterada para ${newRole}.`);
                               }}
                               className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
                                 player.role === 'admin' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-slate-100 text-slate-400'
                               }`}
                            >
                               {player.role === 'admin' ? 'ADM' : 'Atleta'}
                            </button>
                         </td>
                         <td className="px-10 py-6">
                            <div className="flex items-center justify-center gap-3">
                               <button 
                                 onClick={() => {
                                   setAdjustingPoints({
                                     uid: player.uid,
                                     name: player.nickname || player.displayName,
                                     currentPoints: player.rankingPoints
                                   });
                                   setManualPointsForm({ pts: player.rankingPoints, reason: '' });
                                 }}
                                 className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                 title="Ajustar Pontos Manualmente"
                               >
                                 <Edit3 className="w-4 h-4" />
                               </button>
                               <select 
                                 value={player.category}
                                 onChange={(e) => handleUpdatePlayerCategory(player.uid, e.target.value as Category)}
                                 className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-orange-500 outline-none"
                               >
                                 <option>Federados</option>
                                 <option>Não federados</option>
                                 <option>Sub 11</option>
                                 <option>60+</option>
                               </select>
                            </div>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div 
            key="logs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-10"
          >
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Histórico de Ajustes</h2>
                  <p className="text-sm text-slate-500 font-medium">Log de todas as alterações manuais de pontuação.</p>
               </div>
               <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                       <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Filtrar por nome..."
                      value={logFilter}
                      onChange={e => setLogFilter(e.target.value)}
                      className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64 shadow-sm"
                    />
                  </div>
                  <button 
                    onClick={fetchData} 
                    className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <Clock className="w-5 h-5 text-slate-600" />
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                       <th className="px-8 py-6">Data</th>
                       <th className="px-8 py-6">Atleta</th>
                       <th className="px-8 py-6">Ajuste</th>
                       <th className="px-8 py-6">Responsável</th>
                       <th className="px-8 py-6">Motivo</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y">
                     {filteredLogs.map(log => (
                       <tr key={log.id} className="hover:bg-slate-50/50">
                         <td className="px-8 py-6">
                            <span className="text-[10px] font-bold text-slate-400">
                               {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.createdAt))}
                            </span>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex flex-col">
                               <span className="font-bold text-slate-900">{log.targetName}</span>
                               <span className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{log.targetType}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                               <span className="text-xs font-bold text-slate-400 line-through">{log.previousPoints}</span>
                               <span className="font-black text-slate-900">{log.newPoints}</span>
                               <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${log.difference >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                 {log.difference >= 0 ? '+' : ''}{log.difference}
                               </span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <span className="text-xs font-bold text-slate-600">{log.adminName}</span>
                         </td>
                         <td className="px-8 py-6">
                            <p className="text-xs text-slate-500 font-medium italic">{log.reason}</p>
                         </td>
                       </tr>
                     ))}
                     {logs.length === 0 && (
                        <tr>
                           <td colSpan={5} className="py-20 text-center text-slate-400 italic">Nenhum ajuste registrado ainda.</td>
                        </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div 
            key="settings"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white p-12 rounded-[48px] border border-slate-200 shadow-2xl space-y-12 relative overflow-hidden">
               <div className="relative z-10 space-y-10">
                 <div className="space-y-2">
                    {/* Danger Zone */}
                    <div className="mb-10 p-8 bg-red-50 rounded-[40px] border border-red-100 space-y-6">
                      <div className="flex items-center gap-3 text-red-600">
                        <Trash2 className="w-6 h-6" />
                        <h3 className="text-lg font-black uppercase tracking-tighter">Zona de Perigo</h3>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4">
                        {confirmResetUsers ? (
                          <div className="flex-1 flex gap-2">
                             <button 
                               onClick={handleResetUsers}
                               className="flex-1 bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase animate-pulse shadow-lg"
                             >
                               Confirmar Reset?
                             </button>
                             <button 
                               onClick={() => setConfirmResetUsers(false)}
                               className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"
                             >
                               <X className="w-4 h-4" />
                             </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmResetUsers(true)}
                            className="flex-1 bg-white text-red-600 border border-red-200 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            Resetar Todos Usuários
                          </button>
                        )}

                        {confirmProductionReset ? (
                          <div className="flex-1 flex gap-2">
                             <button 
                               onClick={handleProductionReset}
                               className="flex-1 bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase animate-pulse shadow-lg"
                             >
                               Confirmar Wipe?
                             </button>
                             <button 
                               onClick={() => setConfirmProductionReset(false)}
                               className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all"
                             >
                               <X className="w-4 h-4" />
                             </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setConfirmProductionReset(true)}
                            className="flex-1 bg-white text-red-600 border border-red-200 py-4 rounded-2xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            Wipe Produção (Limpeza Geral)
                          </button>
                        )}
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Parametrização de Pontos</h2>
                    <p className="text-slate-500 font-medium">Defina quanto esforço cada vitória vale no Ranking Global.</p>
                  </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6 p-8 bg-blue-50/50 rounded-[32px] border border-blue-100">
                       <div className="flex items-center gap-3">
                          <Trophy className="w-5 h-5 text-blue-600" />
                          <h3 className="font-black uppercase tracking-widest text-sm text-blue-900">Competições</h3>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <label className="text-sm font-bold text-slate-600">Vitória</label>
                             <input 
                               type="number" 
                               value={settings.tournamentWin} 
                               onChange={e => setSettings({...settings, tournamentWin: parseInt(e.target.value) || 0})}
                               className="w-24 px-4 py-3 bg-white border border-blue-200 rounded-2xl font-black text-center text-blue-600"
                             />
                          </div>
                          <div className="flex items-center justify-between">
                             <label className="text-sm font-bold text-slate-600">Participação</label>
                             <input 
                               type="number" 
                               value={settings.tournamentLoss} 
                               onChange={e => setSettings({...settings, tournamentLoss: parseInt(e.target.value) || 0})}
                               className="w-24 px-4 py-3 bg-white border border-blue-200 rounded-2xl font-black text-center text-blue-600"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6 p-8 bg-orange-50/50 rounded-[32px] border border-orange-100">
                       <div className="flex items-center gap-3">
                          <Swords className="w-5 h-5 text-orange-600" />
                          <h3 className="font-black uppercase tracking-widest text-sm text-orange-900">Desafios</h3>
                       </div>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <label className="text-sm font-bold text-slate-600">Vitória</label>
                             <input 
                               type="number" 
                               value={settings.challengeWin} 
                               onChange={e => setSettings({...settings, challengeWin: parseInt(e.target.value) || 0})}
                               className="w-24 px-4 py-3 bg-white border border-orange-200 rounded-2xl font-black text-center text-orange-600"
                             />
                          </div>
                          <div className="flex items-center justify-between">
                             <label className="text-sm font-bold text-slate-600">Participação</label>
                             <input 
                               type="number" 
                               value={settings.challengeLoss} 
                               onChange={e => setSettings({...settings, challengeLoss: parseInt(e.target.value) || 0})}
                               className="w-24 px-4 py-3 bg-white border border-orange-200 rounded-2xl font-black text-center text-orange-600"
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={handleSaveSettings}
                   disabled={loading}
                   className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl hover:bg-orange-500 transition-all shadow-2xl flex items-center justify-center gap-4 active:scale-[0.98]"
                 >
                   {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                   Sincronizar Parâmetros
                 </button>
               </div>
               <div className="absolute left-[-20%] bottom-[-10%] w-[60%] h-[60%] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-[24px] shadow-2xl border flex items-center gap-3 backdrop-blur-md ${
              notification.type === 'error' ? 'bg-red-500/90 text-white border-red-400' : 
              notification.type === 'warning' ? 'bg-orange-500/90 text-white border-orange-400' :
              'bg-slate-900/90 text-white border-slate-700'
            }`}
          >
            {notification.type === 'error' ? <X className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            <span className="font-bold text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
