import { Platform } from 'react-native';
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth as getJSAuth } from 'firebase/auth';

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDKRnURifMmnI4VsiaIim0U8I5au86Mih4',
  authDomain: 'liftly-9f56a.firebaseapp.com',
  projectId: 'liftly-9f56a',
  storageBucket: 'liftly-9f56a.firebasestorage.app',
  messagingSenderId: '541906169729',
  appId: '1:541906169729:web:e5a58ec268dd52c09ac280',
  measurementId: 'G-9PM7NSZJD1'
};

// Initialize JS SDK
let app: any;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

/**
 * On native, we use @react-native-firebase/auth which automatically shares 
 * auth state with the native Kotlin/Swift code.
 * On web, we use the standard Firebase JS SDK.
 */
const getAuthInstance = () => {
  if (Platform.OS === 'web') {
    return getJSAuth(app);
  } else {
    return require('@react-native-firebase/auth').default();
  }
};

export const auth = getAuthInstance();

/**
 * Unified onAuthStateChanged that works on both web and native
 */
export const onAuthStateChanged = (callback: (user: any) => void) => {
  if (Platform.OS === 'web') {
    const { onAuthStateChanged: jsOnAuthStateChanged } = require('firebase/auth');
    return jsOnAuthStateChanged(auth, callback);
  } else {
    return auth.onAuthStateChanged(callback);
  }
};

export { app };
