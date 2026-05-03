import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  NativeModules,
  Platform,
  AppState,
} from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { UrlBlockerModule } = NativeModules;

export default function UrlBlockerScreen() {
  const [regex, setRegex] = useState('');
  const [blockedUrls, setBlockedUrls] = useState<string[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();

  const checkServiceStatus = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const status = await UrlBlockerModule.isAccessibilityServiceEnabled();
        setIsEnabled(status);
      } catch (e) {
        console.error('Failed to check service status', e);
      }
    }
  }, []);

  const loadBlockedUrls = useCallback(async () => {
    if (Platform.OS === 'android') {
      try {
        const urls = await UrlBlockerModule.getBlockedUrls();
        setBlockedUrls(urls);
      } catch (e) {
        console.error('Failed to load blocked URLs', e);
      }
    }
  }, []);

  useEffect(() => {
    loadBlockedUrls();
    checkServiceStatus();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkServiceStatus();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadBlockedUrls, checkServiceStatus]);

  const addRegex = () => {
    if (!regex.trim()) return;
    try {
      new RegExp(regex); // Validate regex
      const newUrls = [...blockedUrls, regex];
      setBlockedUrls(newUrls);
      UrlBlockerModule.setBlockedUrls(newUrls);
      setRegex('');
    } catch (e) {
      Alert.alert('Invalid Regex', 'Please enter a valid regular expression.');
    }
  };

  const removeRegex = (index: number) => {
    const newUrls = blockedUrls.filter((_, i) => i !== index);
    setBlockedUrls(newUrls);
    UrlBlockerModule.setBlockedUrls(newUrls);
  };

  const openSettings = () => {
    if (Platform.OS === 'android') {
      UrlBlockerModule.openAccessibilitySettings();
    } else {
      Alert.alert('Not Supported', 'This feature is only available on Android.');
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <Stack.Screen options={{ title: 'Blocker' }} />
      
      <View style={styles.statusContainer}>
        <ThemedText style={styles.statusLabel}>Service Status:</ThemedText>
        <ThemedText style={[styles.statusValue, { color: isEnabled ? '#4CAF50' : '#F44336' }]}>
          {isEnabled ? 'Active' : 'Inactive'}
        </ThemedText>
        {!isEnabled && (
          <TouchableOpacity style={styles.enableButton} onPress={openSettings}>
            <Text style={styles.enableButtonText}>Enable in Settings</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text, borderColor: Colors[colorScheme].tabIconDefault }]}
          placeholder="Enter URL Regex (e.g. reddit\.com)"
          placeholderTextColor="#999"
          value={regex}
          onChangeText={setRegex}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.addButton} onPress={addRegex}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ThemedText style={styles.listTitle}>Blocked Patterns:</ThemedText>
      <FlatList
        data={blockedUrls}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.listItem}>
            <ThemedText style={styles.listItemText}>{item}</ThemedText>
            <TouchableOpacity onPress={() => removeRegex(index)}>
              <ThemedText style={styles.removeText}>Remove</ThemedText>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <ThemedText style={styles.emptyText}>No patterns added yet.</ThemedText>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 20,
  },
  enableButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  enableButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  listItemText: {
    fontSize: 16,
  },
  removeText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
  },
});
