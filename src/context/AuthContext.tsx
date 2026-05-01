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
          
          // Minimal admin check
          if (user.email === 'heronred@gmail.com' || user.email === 'nikkeicuritibatenisdemesa@gmail.com') {
            if (profileData.role !== 'admin') {
              await updateDoc(profileRef, { role: 'admin', isApproved: true });
            }
          }
          setProfile(profileData);
        } else {
          // Create simple initial profile for new user
          const newProfile: UserProfile = {
            uid: user.uid,
            displayName: user.displayName || 'Jogador',
            nickname: user.displayName || 'Jogador',
            email: user.email || '',
            photoURL: user.photoURL || undefined,
            role: (user.email === 'heronred@gmail.com' || user.email === 'nikkeicuritibatenisdemesa@gmail.com') ? 'admin' : 'player',
            isApproved: (user.email === 'heronred@gmail.com' || user.email === 'nikkeicuritibatenisdemesa@gmail.com'),
            category: 'Não federados',
            rankingPoints: 0,
            createdAt: new Date().toISOString(),
          };

          await setDoc(profileRef, newProfile);
          
          if (user.email === 'heronred@gmail.com' || user.email === 'nikkeicuritibatenisdemesa@gmail.com') {
            await setDoc(doc(db, 'admins', user.uid), { createdAt: new Date().toISOString() });
          }
          
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
