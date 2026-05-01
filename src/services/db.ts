import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Match, Tournament, UserProfile, Challenge, Category } from '../types';

export const dbService = {
  // --- RANKINGS ---
  getRankings: (category: Category, callback: (users: UserProfile[]) => void) => {
    const uq = query(
      collection(db, 'users'),
      where('category', '==', category),
      orderBy('rankingPoints', 'desc'),
      limit(200)
    );
    
    const aq = query(
      collection(db, 'athletes'),
      where('category', '==', category),
      orderBy('rankingPoints', 'desc'),
      limit(200)
    );
 
    let rawUsers: UserProfile[] = [];
    let rawAthletes: any[] = [];
 
    const handleUpdate = () => {
      // Create a map for quick lookup of approved users by their linked athlete ID
      const userMap = new Map<string, UserProfile>();
      rawUsers.forEach(u => {
        if (u.linkedAthleteId) {
          userMap.set(u.linkedAthleteId, u);
        }
      });
 
      const merged = rawAthletes.map(athlete => {
        const linkedUser = userMap.get(athlete.id);
        
        // Se estiver vinculado a um admin, removemos do ranking
        if (linkedUser && linkedUser.role === 'admin') return null;

        // Se houver um usuário vinculado e aprovado, usamos o perfil dele (para exibir foto, etc)
        if (linkedUser && linkedUser.isApproved) {
          return linkedUser;
        }
 
        return {
          uid: athlete.linkedUserId || `athlete_${athlete.id}`,
          displayName: athlete.name,
          nickname: athlete.name,
          email: athlete.linkedEmail || athlete.email || '',
          role: 'player',
          isApproved: true,
          category: athlete.category,
          rankingPoints: athlete.rankingPoints || 0,
          athleteId: athlete.id,
          photoURL: linkedUser?.photoURL
        } as UserProfile;
      })
      .filter((u): u is UserProfile => u !== null)
      .sort((a, b) => (b.rankingPoints || 0) - (a.rankingPoints || 0))
      .slice(0, 100);
 
      callback(merged);
    };
 
    const unsubUsers = onSnapshot(uq, (snapshot) => {
      rawUsers = snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      handleUpdate();
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'users'));
 
    const unsubAthletes = onSnapshot(aq, (snapshot) => {
      rawAthletes = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      handleUpdate();
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'athletes'));

    return () => {
      unsubUsers();
      unsubAthletes();
    };
  },

  // --- TOURNAMENTS ---
  getTournaments: (callback: (tournaments: Tournament[]) => void) => {
    const q = query(collection(db, 'tournaments'), orderBy('startDate', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Tournament)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tournaments'));
  },

  // --- MATCHES ---
  getUserMatches: (userId: string, callback: (matches: Match[]) => void) => {
    const q1 = query(
      collection(db, 'matches'),
      where('player1Id', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );
    const q2 = query(
      collection(db, 'matches'),
      where('player2Id', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(20)
    );

    let matches1: Match[] = [];
    let matches2: Match[] = [];

    const handleUpdate = () => {
      const merged = [...matches1, ...matches2]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 20);
      callback(merged);
    };

    const unsub1 = onSnapshot(q1, (snapshot) => {
      matches1 = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
      handleUpdate();
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'matches'));

    const unsub2 = onSnapshot(q2, (snapshot) => {
      matches2 = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
      handleUpdate();
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'matches'));

    return () => {
      unsub1();
      unsub2();
    };
  },

  getFinishedMatchesForUser: (userId: string, callback: (matches: Match[]) => void) => {
    const q1 = query(
      collection(db, 'matches'),
      where('player1Id', '==', userId),
      where('status', '==', 'finished'),
      orderBy('updatedAt', 'asc')
    );
    const q2 = query(
      collection(db, 'matches'),
      where('player2Id', '==', userId),
      where('status', '==', 'finished'),
      orderBy('updatedAt', 'asc')
    );

    let matches1: Match[] = [];
    let matches2: Match[] = [];

    const handleUpdate = () => {
      const merged = [...matches1, ...matches2]
        .sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
      callback(merged);
    };

    const unsub1 = onSnapshot(q1, (snapshot) => {
      matches1 = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
      handleUpdate();
    });

    const unsub2 = onSnapshot(q2, (snapshot) => {
      matches2 = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match));
      handleUpdate();
    });

    return () => {
      unsub1();
      unsub2();
    };
  },

  getTournamentMatches: (tournamentId: string, callback: (matches: Match[]) => void) => {
    const q = query(
      collection(db, 'matches'),
      where('tournamentId', '==', tournamentId),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `matches-tournament-${tournamentId}`));
  },

  getRecentResults: (callback: (matches: Match[]) => void) => {
    const q = query(
      collection(db, 'matches'),
      where('status', '==', 'finished'),
      orderBy('updatedAt', 'desc'),
      limit(5)
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'matches'));
  },

  getPendingMatches: (callback: (matches: Match[]) => void) => {
    const q = query(
      collection(db, 'matches'),
      where('status', '==', 'scheduled'),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Match)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'matches'));
  },

  // --- CHALLENGES ---
  getChallenges: (userId: string, callback: (challenges: Challenge[]) => void) => {
    const q = query(
      collection(db, 'challenges'),
      where('challengedId', '==', userId),
      where('status', '==', 'pending')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Challenge)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'challenges'));
  },

  getSentChallenges: (userId: string, callback: (challenges: Challenge[]) => void) => {
    const q = query(
      collection(db, 'challenges'),
      where('challengerId', '==', userId),
      where('status', '==', 'pending')
    );
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Challenge)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'challenges-sent'));
  },

  createChallenge: async (challengerId: string, challengerName: string, challengedId: string, challengedName: string, category: Category) => {
    try {
      await addDoc(collection(db, 'challenges'), {
        challengerId,
        challengerName,
        challengedId,
        challengedName,
        status: 'pending',
        category,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'challenges');
    }
  },

  refuseChallenge: async (challengeId: string) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, { status: 'declined' });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'challenges');
    }
  },

  acceptChallenge: async (challengeId: string, challengerName: string, challengedName: string, challengerId: string, challengedId: string, category: Category) => {
    try {
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, { status: 'accepted' });

      // Create a match for this challenge
      await addDoc(collection(db, 'matches'), {
        player1Id: challengerId,
        player1Name: challengerName,
        player2Id: challengedId,
        player2Name: challengedName,
        category,
        status: 'scheduled',
        type: 'challenge',
        date: new Date().toISOString(),
        challengeId,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'challenges');
    }
  }
};
