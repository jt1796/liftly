import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/context/auth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function LoginScreen() {
  const { signInWithGoogle, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error(error);
      // Handle error (e.g., show an alert)
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>Liftly</ThemedText>
        <ThemedText style={styles.subtitle}>Track your workouts with ease.</ThemedText>
        
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          <IconSymbol name="person.circle.fill" size={24} color="white" />
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'Signing in...' : 'Sign in with Google'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    opacity: 0.7,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    gap: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
