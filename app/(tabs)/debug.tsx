import { Image } from 'expo-image';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Collapsible } from '@/components/ui/collapsible';
import { useState } from 'react';
import { Fonts } from '@/constants/theme';

export default function DebugScreen() {
  const [storageDump, setStorageDump] = useState<string | null>(null);
  const { user, signOut } = useAuth();

  const dumpStorage = async () => {
    try {
      const keys = await ReactNativeAsyncStorage.getAllKeys();
      const result = await ReactNativeAsyncStorage.multiGet(keys);
      let dumpText = '';
      result.forEach(([key, value]) => {
        dumpText += `${key}:\n${value}\n\n`;
      });
      setStorageDump(dumpText || 'Storage is empty');
      console.log('--- AsyncStorage Dump ---\n', dumpText);
    } catch (error) {
      console.error('Error dumping storage:', error);
      alert('Error dumping storage');
    }
  };

  const clearStorage = async () => {
    try {
      await ReactNativeAsyncStorage.clear();
      setStorageDump(null);
      alert('Storage cleared! You may need to restart the app.');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welcome{user?.displayName ? ` ${user.displayName}` : user?.email ? ` ${user.email}` : ''}!</ThemedText>
        <HelloWave />
      </ThemedView>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <ThemedText type="defaultSemiBold">Sign Out</ThemedText>
      </TouchableOpacity>

      <Collapsible title="Debug Storage">
        <ThemedText>
          Use these buttons to inspect or reset the local app storage (AsyncStorage).
        </ThemedText>
        <ThemedView style={styles.debugButtons}>
          <TouchableOpacity style={[styles.button, styles.dumpButton]} onPress={dumpStorage}>
            <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Show on Screen</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearStorage}>
            <ThemedText type="defaultSemiBold" style={{ color: 'white' }}>Clear All</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {storageDump && (
          <ThemedView style={styles.dumpContainer}>
            <ThemedView style={styles.dumpHeader}>
              <ThemedText type="defaultSemiBold">Current Storage:</ThemedText>
              <TouchableOpacity onPress={() => setStorageDump(null)}>
                <ThemedText type="link">Hide</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            <ScrollView style={styles.dumpScroll} nestedScrollEnabled={true}>
              <ThemedText style={styles.dumpText}>{storageDump}</ThemedText>
            </ScrollView>
          </ThemedView>
        )}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  debugButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  dumpContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  dumpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dumpButton: {
    backgroundColor: '#2196F3',
  },
  button: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  dumpText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
  dumpScroll: {
    maxHeight: 200,
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
