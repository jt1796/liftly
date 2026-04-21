import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut as firebaseSignOut, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '541906169729-tlfiehkl4rdenhk5uuefg33akj181prk.apps.googleusercontent.com',
      offlineAccess: true,
    });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      // In newer versions of the library, the response format changed
      const data = 'data' in response ? response.data : response;
      const idToken = data?.idToken;
      
      if (!idToken) {
        console.error('Google Sign-In response:', JSON.stringify(response));
        throw new Error('No idToken returned from Google Sign-In. Check webClientId and SHA-1.');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available or outdated');
      } else {
        console.error('Google Sign-In Error:', error.code, error.message);
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign-Out Error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
