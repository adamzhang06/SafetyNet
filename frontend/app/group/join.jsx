import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function JoinGroupScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Join Group Screen</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/dashboard')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Go to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 24,
  },
  title: {
    color: '#FFF',
    fontSize: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#7F3B4A',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
