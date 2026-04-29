import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import { Platform } from 'react-native';

// Types for cross-platform compatibility
type FirebaseUser = any; 

interface AuthContextType {
  user: FirebaseUser | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '541906169729-tlfiehkl4rdenhk5uuefg33akj181prk.apps.googleusercontent.com',
      offlineAccess: true,
    });

    const unsubscribe = onAuthStateChanged((user: FirebaseUser) => {
      setUser(user);
      setIsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      
      const data = 'data' in response ? response.data : response;
      const idToken = data?.idToken;
      
      if (!idToken) {
        throw new Error('No idToken returned from Google Sign-In.');
      }

      if (Platform.OS === 'web') {
        const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth');
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } else {
        // Native SDK
        const authModule = require('@react-native-firebase/auth').default;
        const credential = authModule.GoogleAuthProvider.credential(idToken);
        await auth.signInWithCredential(credential);
        
        // Trigger widget update on Android
        if (Platform.OS === 'android') {
          try {
            const { NativeModules } = require('react-native');
            if (NativeModules.WidgetModule) {
              NativeModules.WidgetModule.refreshWidgets();
            }
          } catch (e) {
            console.log('Widget module not found, skipping refresh');
          }
        }
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow');
      } else {
        console.error('Google Sign-In Error:', error.code, error.message);
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.signOut();
      
      if (Platform.OS === 'web') {
        const { signOut: firebaseSignOut } = await import('firebase/auth');
        await firebaseSignOut(auth);
      } else {
        await auth.signOut();
        
        // Trigger widget update on Android
        if (Platform.OS === 'android') {
          try {
            const { NativeModules } = require('react-native');
            if (NativeModules.WidgetModule) {
              NativeModules.WidgetModule.refreshWidgets();
            }
          } catch (e) {
            // Ignore
          }
        }
      }
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
