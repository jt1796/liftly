import { useState } from 'react';
import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

export default function TabTwoScreen() {
  const [storageDump, setStorageDump] = useState<string | null>(null);

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
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Explore
        </ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>

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
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two screens:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  debugButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  dumpButton: {
    backgroundColor: '#2196F3',
  },
  clearButton: {
    backgroundColor: '#f44336',
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
  dumpScroll: {
    maxHeight: 200,
  },
  dumpText: {
    fontFamily: Fonts.mono,
    fontSize: 12,
  },
});
