import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useLocalSearchParams } from 'expo-router';

export default function WebScreen() {
  const { user, isLoading } = useAuth();
  const [injectedJS, setInjectedJS] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  const { path } = useLocalSearchParams<{ path: string }>();

  const baseUri = 'https://liftly-9f56a.web.app';
  const targetUri = path ? `${baseUri}/${path}` : baseUri;

  useEffect(() => {
    const prepareAuthInjection = async () => {
      if (user) {
        try {
          // Get the ID token and other necessary data to reconstruct the Firebase Auth state
          const token = await user.getIdToken();
          const authData = {
            uid: user.uid,
            email: user.email,
            emailVerified: user.emailVerified,
            displayName: user.displayName,
            isAnonymous: user.isAnonymous,
            photoURL: user.photoURL,
            providerData: user.providerData,
            stsTokenManager: {
              refreshToken: (user as any).stsTokenManager?.refreshToken || '',
              accessToken: token,
              expirationTime: (user as any).stsTokenManager?.expirationTime || Date.now() + 3600000,
            },
            createdAt: (user as any).metadata?.createdAt || Date.now().toString(),
            lastLoginAt: (user as any).metadata?.lastLoginAt || Date.now().toString(),
            apiKey: 'AIzaSyDKRnURifMmnI4VsiaIim0U8I5au86Mih4', // From firebase.ts
            appName: '[DEFAULT]',
          };

          const key = `firebase:authUser:${authData.apiKey}:[DEFAULT]`;
          const script = `
            (function() {
              try {
                localStorage.setItem('${key}', JSON.stringify(${JSON.stringify(authData)}));
                // Also try to set it in a way that doesn't overwrite if the web app is already logged in as someone else
                // But for auto-login, we generally want to force this session.
              } catch (e) {
                console.error('Failed to inject auth', e);
              }
            })();
            true; // note: this is required, or the injection will fail
          `;
          setInjectedJS(script);
        } catch (error) {
          console.error('Error preparing auth injection:', error);
          setInjectedJS('true;');
        }
      } else {
        setInjectedJS('true;');
      }
    };

    if (!isLoading) {
      prepareAuthInjection();
    }
  }, [user, isLoading]);

  if (isLoading || (user && !injectedJS)) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <WebView 
        source={{ uri: targetUri }} 
        style={[styles.webview, { backgroundColor: theme.background }]}
        injectedJavaScriptBeforeContentLoaded={injectedJS || 'true;'}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        setBuiltInZoomControls={false}
        bounces={false}
        overScrollMode="never"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
