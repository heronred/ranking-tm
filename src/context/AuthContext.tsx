import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, runTransaction, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { auth, db, signIn as firebaseSignIn, logOut as firebaseLogOut } from '../lib/firebase';
import { UserProfile, Category } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const profileRef = doc(db, 'users', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const profileData = profileSnap.data() as UserProfile;
          
          // CHECK FOR AUTO-LINK even if profile exists (if not linked yet)
          if (!profileData.athleteId && profileData.role !== 'admin' && user.email) {
            const athletesRef = collection(db, 'athletes');
            
            // Tenta primeiro pelo linkedEmail (campo mais atual)
            let q = query(athletesRef, where('linkedEmail', '==', user.email));
            let querySnapshot = await getDocs(q);
            
            // Se não encontrar, tenta pelo campo 'email' (compatibilidade)
            if (querySnapshot.empty) {
              q = query(athletesRef, where('email', '==', user.email));
              querySnapshot = await getDocs(q);
            }
            
            if (!querySnapshot.empty) {
              const athleteDoc = querySnapshot.docs[0];
              const athleteId = athleteDoc.id;
              const athleteData = athleteDoc.data();
              
              await runTransaction(db, async (transaction) => {
                transaction.update(profileRef, {
                  athleteId: athleteId,
                  isApproved: true,
                  category: athleteData.category,
                  rankingPoints: athleteData.rankingPoints,
                  nickname: profileData.nickname || athleteData.name || profileData.displayName,
                  updatedAt: new Date().toISOString()
                });
                transaction.update(doc(db, 'athletes', athleteId), {
                  linkedUserId: user.uid,
                  updatedAt: new Date().toISOString()
                });
              });
              // Update local profile data for immediate sync
              profileData.athleteId = athleteId;
              profileData.isApproved = true;
              profileData.category = athleteData.category;
              profileData.rankingPoints = athleteData.rankingPoints;
            }
          }

          if (user.email === 'heronred@gmail.com' || user.email === 'nikkeicuritibatenisdemesa@gmail.com') {
            const adminRef = doc(db, 'admins', user.uid);
            const adminSnap = await getDoc(adminRef);
            
            // Ensure all required fields for admin profile
            const needsRepair = !adminSnap.exists() || 
                               profileData.role !== 'admin' || 
                               profileData.isApproved !== true ||
                               profileData.category === undefined ||
                               profileData.rankingPoints === undefined ||
                               profileData.nickname === undefined;

            if (needsRepair) {
              await runTransaction(db, async (transaction) => {
                transaction.set(profileRef, { 
                  role: 'admin', 
                  isApproved: true,
                  category: profileData.category || 'Não federados',
                  rankingPoints: profileData.rankingPoints || 0,
                  nickname: profileData.nickname || profileData.displayName || 'Admin'
                }, { merge: true });
                transaction.set(adminRef, { createdAt: new Date().toISOString() });
              });
            } else if (profileData.rankingPoints > 0) {
              // Internal reset for admin as requested
              await updateDoc(profileRef, { 
                rankingPoints: 0,
                updatedAt: new Date().toISOString()
              });
            }
          }
          setProfile(profileData);
        } else {
          // Check for auto-link with athletes list
          let athleteData: any = null;
          let athleteId: string | null = null;

          if (user.email) {
            const athletesRef = collection(db, 'athletes');
            let q = query(athletesRef, where('linkedEmail', '==', user.email));
            let querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
              q = query(athletesRef, where('email', '==', user.email));
              querySnapshot = await getDocs(q);
            }
            
            if (!querySnapshot.empty) {
              const docSnap = querySnapshot.docs[0];
              athleteData = docSnap.data();
              athleteId = docSnap.id;
            }
          }

          // Create initial profile
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: athleteData?.name || user.displayName || 'Jogador',
            nickname: athleteData?.name || user.displayName || 'Jogador',
            email: user.email || '',
            photoURL: user.photoURL || undefined,
            role: (user.email === 'heronred@gmail.com' || user.email === 'nikkeicuritibatenisdemesa@gmail.com') ? 'admin' : 'player',
            isApproved: (user.email === 'heronred@gmail.com' || user.email === 'nikkeicuritibatenisdemesa@gmail.com') || athleteData !== null,
            category: athleteData?.category || 'Não federados',
            rankingPoints: athleteData?.rankingPoints || 0,
            athleteId: athleteId || undefined,
            createdAt: new Date().toISOString(),
          };

          await runTransaction(db, async (transaction) => {
            transaction.set(profileRef, newProfile);
            if (user.email === 'heronred@gmail.com' || user.email === 'nikkeicuritibatenisdemesa@gmail.com') {
              transaction.set(doc(db, 'admins', user.uid), { createdAt: new Date().toISOString() });
            }
            if (athleteId) {
              // Update athlete to mark as linked
              transaction.update(doc(db, 'athletes', athleteId), { 
                linkedUserId: user.uid,
                updatedAt: new Date().toISOString()
              });
            }
          });
          
          setProfile(newProfile);
        }

        // Listen for real-time profile changes
        onSnapshot(profileRef, (doc) => {
          if (doc.exists()) {
            setProfile(doc.data() as UserProfile);
          }
        });
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    await firebaseSignIn();
  };

  const logOut = async () => {
    await firebaseLogOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
