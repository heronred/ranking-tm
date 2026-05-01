import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  increment,
  runTransaction,
  query,
  where,
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Match, Tournament, UserProfile, Category, Athlete, PointsLog, TournamentStatus } from '../types';

export interface AppSettings {
  tournamentWin: number;
  tournamentLoss: number;
  challengeWin: number;
  challengeLoss: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  tournamentWin: 100,
  tournamentLoss: 10,
  challengeWin: 50,
  challengeLoss: 5
};

const cleanObject = (obj: any) => {
  const newObj = { ...obj };
  Object.keys(newObj).forEach(key => {
    if (newObj[key] === undefined) {
      delete newObj[key];
    }
  });
  return newObj;
};

export const adminService = {
  // Settings Management
  async getSettings(): Promise<AppSettings> {
    try {
      const docRef = doc(db, 'settings', 'points');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
      }
      return DEFAULT_SETTINGS;
    } catch (err) {
      console.error("Error fetching settings:", err);
      return DEFAULT_SETTINGS;
    }
  },

  async updateSettings(settings: AppSettings) {
    try {
      const docRef = doc(db, 'settings', 'points');
      await setDoc(docRef, settings);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'settings/points');
    }
  },

  // Athlete Management
  async getAllPlayers(): Promise<UserProfile[]> {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      return usersSnap.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'users');
      return [];
    }
  },

  async createAthlete(athlete: Omit<Athlete, 'id' | 'createdAt'>): Promise<string | undefined> {
    try {
      const docRef = await addDoc(collection(db, 'athletes'), cleanObject({
        ...athlete,
        rankingPoints: athlete.rankingPoints || 0,
        linkedUserId: null, // Critical: explicitly set to null for orphan queries
        createdAt: new Date().toISOString()
      }));
      return docRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'athletes');
    }
  },

  async getAthletes(): Promise<Athlete[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'athletes'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Athlete));
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'athletes');
      return [];
    }
  },

  async deleteAthlete(id: string) {
    try {
      await deleteDoc(doc(db, 'athletes', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `athletes/${id}`);
    }
  },

  async linkUserToAthlete(uid: string, athleteId: string) {
    try {
      const athleteRef = doc(db, 'athletes', athleteId);
      const athleteSnap = await getDoc(athleteRef);
      if (!athleteSnap.exists()) throw new Error("Athlete profile not found");
      const athleteData = athleteSnap.data() as Athlete;

      const userRef = doc(db, 'users', uid);
      
      await runTransaction(db, async (transaction) => {
        // Update User
        transaction.update(userRef, {
          athleteId,
          category: athleteData.category,
          rankingPoints: athleteData.rankingPoints,
          nickname: athleteData.name, // Usually use athlete name as nickname initially
          isApproved: true
        });

        // Update Athlete
        transaction.update(athleteRef, {
          linkedUserId: uid
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'link-user-athlete');
    }
  },

  async updatePlayerCategory(uid: string, category: Category) {
    try {
      if (uid.startsWith('athlete_')) {
        const id = uid.replace('athlete_', '');
        await updateDoc(doc(db, 'athletes', id), { category });
      } else {
        await updateDoc(doc(db, 'users', uid), { category });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users-athletes/${uid}`);
    }
  },

  async updateUserApproval(uid: string, isApproved: boolean) {
    try {
      if (uid.startsWith('athlete_')) return; // Athletes are always approved
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { isApproved });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  },

  async updateUserNickname(uid: string, nickname: string) {
    try {
      if (uid.startsWith('athlete_')) {
        const id = uid.replace('athlete_', '');
        await updateDoc(doc(db, 'athletes', id), { name: nickname });
      } else {
        await updateDoc(doc(db, 'users', uid), { nickname });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users-athletes/${uid}`);
    }
  },

  async updateUserRole(uid: string, role: 'admin' | 'player') {
    try {
      if (uid.startsWith('athlete_')) return; // Athletes can't be admins yet
      const userRef = doc(db, 'users', uid);
      const adminRef = doc(db, 'admins', uid);
      
      await runTransaction(db, async (transaction) => {
        transaction.update(userRef, { role });
        if (role === 'admin') {
          transaction.set(adminRef, { createdAt: new Date().toISOString() });
        } else {
          transaction.delete(adminRef);
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
    }
  },

  // Tournament & Match Management
  createTournament: async (tournament: Omit<Tournament, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'tournaments'), {
        ...tournament,
        isActive: tournament.isActive ?? true,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'tournaments');
    }
  },

  updateTournamentStatus: async (tournamentId: string, status: TournamentStatus) => {
    try {
      const tourneyRef = doc(db, 'tournaments', tournamentId);
      await updateDoc(tourneyRef, { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tournaments/${tournamentId}`);
    }
  },

  updateTournamentActive: async (tournamentId: string, isActive: boolean) => {
    try {
      const tourneyRef = doc(db, 'tournaments', tournamentId);
      await updateDoc(tourneyRef, { isActive });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tournaments/${tournamentId}`);
    }
  },

  deleteTournament: async (tournamentId: string) => {
    if (!tournamentId) throw new Error("ID do torneio não fornecido.");
    try {
      console.log('Iniciando exclusão do torneio:', tournamentId);
      const matchesRef = collection(db, 'matches');
      const q = query(matchesRef, where('tournamentId', '==', tournamentId));
      const matchesSnap = await getDocs(q);
      
      const finishedMatches = matchesSnap.docs.filter(doc => (doc.data() as Match).status === 'finished');
      if (finishedMatches.length > 0) {
        console.warn('Exclusão abortada: Torneio possui partidas finalizadas.');
        throw new Error(`Não é possível excluir: ${finishedMatches.length} partidas deste torneio já possuem resultados.`);
      }

      console.log(`Excluindo ${matchesSnap.docs.length} partidas associadas...`);
      const batch = writeBatch(db);
      matchesSnap.docs.forEach(m => batch.delete(m.ref));
      batch.delete(doc(db, 'tournaments', tournamentId));
      
      await batch.commit();
      console.log('Torneio e partidas excluídos com sucesso.');
    } catch (err: any) {
      console.error('Erro ao deletar torneio:', err);
      if (err instanceof Error && err.message.includes("Não é possível excluir")) throw err;
      handleFirestoreError(err, OperationType.DELETE, `tournaments/${tournamentId}`);
    }
  },

  createMatch: async (match: Omit<Match, 'id' | 'updatedAt'>) => {
    try {
      await addDoc(collection(db, 'matches'), cleanObject({
        ...match,
        updatedAt: new Date().toISOString()
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'matches');
    }
  },

  updateMatchResult: async (matchId: string, player1Score: number, player2Score: number, winnerId: string) => {
    try {
      const settings = await adminService.getSettings();
      
      const matchRef = doc(db, 'matches', matchId);
      const matchSnapDoc = await getDoc(matchRef);
      if (!matchSnapDoc.exists()) throw new Error("Match does not exist");
      const matchData = matchSnapDoc.data() as Match;

      await runTransaction(db, async (transaction) => {
        const p1IsAthlete = matchData.player1Id.startsWith('athlete_');
        const p1Id = p1IsAthlete ? matchData.player1Id.replace('athlete_', '') : matchData.player1Id;
        const p1Ref = doc(db, p1IsAthlete ? 'athletes' : 'users', p1Id);

        const p2IsAthlete = matchData.player2Id.startsWith('athlete_');
        const p2Id = p2IsAthlete ? matchData.player2Id.replace('athlete_', '') : matchData.player2Id;
        const p2Ref = doc(db, p2IsAthlete ? 'athletes' : 'users', p2Id);

        // All READS must be here
        const [tMatchSnap, p1Snap, p2Snap] = await Promise.all([
          transaction.get(matchRef),
          transaction.get(p1Ref),
          transaction.get(p2Ref)
        ]);

        if (!tMatchSnap.exists()) throw new Error("Match does not exist");
        const currentMatch = tMatchSnap.data() as Match;
        if (currentMatch.status === 'finished') throw new Error("Match already finished");

        const isTournament = !!currentMatch.tournamentId;
        const winPoints = isTournament ? settings.tournamentWin : settings.challengeWin;
        const lossPoints = isTournament ? settings.tournamentLoss : settings.challengeLoss;

        const isP1Winner = winnerId === currentMatch.player1Id;
        const p1Points = isP1Winner ? winPoints : lossPoints;
        const p2Points = !isP1Winner ? winPoints : lossPoints;

        // All WRITES must be here
        transaction.update(matchRef, {
          player1Score,
          player2Score,
          winnerId,
          status: 'finished',
          finishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        if (p1Snap.exists() && p1Snap.data().role !== 'admin') {
          transaction.update(p1Ref, { rankingPoints: increment(p1Points) });
        }
        
        if (p2Snap.exists() && p2Snap.data().role !== 'admin') {
          transaction.update(p2Ref, { rankingPoints: increment(p2Points) });
        }
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'matches/ranking');
    }
  },

  updateMatch: async (matchId: string, updates: Partial<Match>) => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      await updateDoc(matchRef, cleanObject({
        ...updates,
        updatedAt: new Date().toISOString()
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `matches/${matchId}`);
    }
  },

  deleteMatch: async (matchId: string) => {
    try {
      const matchRef = doc(db, 'matches', matchId);
      const matchSnap = await getDoc(matchRef);
      
      if (!matchSnap.exists()) return;
      const matchData = matchSnap.data() as Match;

      // If finished, revert points
      if (matchData.status === 'finished') {
        const settings = await adminService.getSettings();
        const isTournament = !!matchData.tournamentId;
        const winPoints = isTournament ? settings.tournamentWin : settings.challengeWin;
        const lossPoints = isTournament ? settings.tournamentLoss : settings.challengeLoss;

        const p1Points = matchData.winnerId === matchData.player1Id ? winPoints : lossPoints;
        const p2Points = matchData.winnerId === matchData.player2Id ? winPoints : lossPoints;

        await runTransaction(db, async (transaction) => {
          const p1IsAthlete = matchData.player1Id.startsWith('athlete_');
          const p1Id = p1IsAthlete ? matchData.player1Id.replace('athlete_', '') : matchData.player1Id;
          const p1Ref = doc(db, p1IsAthlete ? 'athletes' : 'users', p1Id);

          const p2IsAthlete = matchData.player2Id.startsWith('athlete_');
          const p2Id = p2IsAthlete ? matchData.player2Id.replace('athlete_', '') : matchData.player2Id;
          const p2Ref = doc(db, p2IsAthlete ? 'athletes' : 'users', p2Id);

          transaction.update(p1Ref, { rankingPoints: increment(-p1Points) });
          transaction.update(p2Ref, { rankingPoints: increment(-p2Points) });
          transaction.delete(matchRef);
        });
      } else {
        await deleteDoc(matchRef);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `matches/${matchId}`);
    }
  },

  async resetRankingPoints(uid: string) {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { 
        rankingPoints: 0,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/reset-points`);
    }
  },

  async productionReset(athletesToDelete: string[]) {
    try {
      console.log('AdminService: Iniciando limpeza para produção...');
      const batch = writeBatch(db);

      // 1. Reset all users rankingPoints
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.docs.forEach(u => {
        batch.update(u.ref, { rankingPoints: 0, updatedAt: new Date().toISOString() });
      });

      // 2. Reset and potentially delete athletes
      const athletesSnap = await getDocs(collection(db, 'athletes'));
      athletesSnap.docs.forEach(a => {
        const data = a.data() as Athlete;
        if (athletesToDelete.includes(data.name)) {
          console.log(`AdminService: Excluindo atleta solicitado: ${data.name}`);
          batch.delete(a.ref);
        } else {
          batch.update(a.ref, { rankingPoints: 0 });
        }
      });

      await batch.commit();
      console.log('AdminService: Limpeza concluída.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'production-reset');
    }
  },

  truncateMatches: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'matches'));
      const batchSize = 10;
      for (let i = 0; i < querySnapshot.docs.length; i += batchSize) {
        const batch = querySnapshot.docs.slice(i, i + batchSize);
        await Promise.all(batch.map(d => deleteDoc(doc(db, 'matches', d.id))));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'matches/truncate');
    }
  },

  truncateTournaments: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'tournaments'));
      const batchSize = 10;
      for (let i = 0; i < querySnapshot.docs.length; i += batchSize) {
        const batch = querySnapshot.docs.slice(i, i + batchSize);
        await Promise.all(batch.map(d => deleteDoc(doc(db, 'tournaments', d.id))));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'tournaments/truncate');
    }
  },

  async fullProductionWipe() {
    console.log('AdminService: Iniciando WIPE TOTAL para produção...');
    await this.truncateMatches();
    await this.truncateTournaments();
    await this.productionReset(["Lais Arruda Fontolan", "Atleta 01", "Atleta 02"]);
    console.log('AdminService: WIPE TOTAL concluído.');
  },

  async resetNonAdminUsers(adminEmails: string[]) {
    try {
      console.log('AdminService: Resetando usuários não administradores...');
      const usersSnap = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      
      usersSnap.docs.forEach(u => {
        const data = u.data() as UserProfile;
        if (!adminEmails.includes(data.email)) {
          console.log(`AdminService: Excluindo usuário: ${data.email}`);
          batch.delete(u.ref);
        }
      });
      
      await batch.commit();

      // Also reset linkedUserId in athletes
      const athletesSnap = await getDocs(collection(db, 'athletes'));
      const athleteBatch = writeBatch(db);
      athletesSnap.docs.forEach(a => {
        athleteBatch.update(a.ref, { linkedUserId: null });
      });
      await athleteBatch.commit();
      
      console.log('AdminService: Reset concluído.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'reset-users');
    }
  },

  async manualPointsAdjustment(uid: string, newPoints: number, reason: string, adminId: string, adminName: string) {
    try {
      const isAthlete = uid.startsWith('athlete_');
      const id = isAthlete ? uid.replace('athlete_', '') : uid;
      const ref = doc(db, isAthlete ? 'athletes' : 'users', id);
      
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(ref);
        if (!snap.exists()) {
          throw new Error("Entidade não encontrada.");
        }
        
        const data = snap.data();
        const previousPoints = data.rankingPoints || 0;
        const targetName = isAthlete ? data.name : (data.nickname || data.displayName);
        
        // Update Points
        transaction.update(ref, { 
          rankingPoints: newPoints,
          updatedAt: new Date().toISOString()
        });
        
        // Log Change
        const logRef = doc(collection(db, 'points_logs'));
        transaction.set(logRef, {
          targetId: uid,
          targetName,
          targetType: isAthlete ? 'athlete' : 'user',
          previousPoints,
          newPoints,
          difference: newPoints - previousPoints,
          reason,
          adminId,
          adminName,
          createdAt: new Date().toISOString()
        });
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `points-adjustment/${uid}`);
    }
  },

  async getPointsLogs(): Promise<PointsLog[]> {
    try {
      const q = query(collection(db, 'points_logs'));
      const snap = await getDocs(q);
      return snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as PointsLog))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'points_logs');
      return [];
    }
  }
};
