import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

// Mock group members – replace with real data / API
const MOCK_GROUP = [
  { id: '1', name: 'Crunk Cynthia', initials: 'CC', phone: '+15551234001', status: 'safe' },
  { id: '2', name: 'Designated Dave', initials: 'DD', phone: '+15551234002', status: 'safe' },
  { id: '3', name: 'Green Mike', initials: 'GM', phone: '+15551234003', status: 'caution' },
  { id: '4', name: 'Sam', initials: 'SK', phone: '+15551234004', status: 'safe' },
];

const STATUS_COLORS = { safe: '#4CAF50', caution: '#FFC107', alert: '#F44336' };

export default function GroupScreen() {
  const handleProfilePress = () => router.push('/profile');
  const handleViewMapPress = () => router.push('/dashboard/group-map');

  const handleCall = (person) => {
    if (person.phone) Linking.openURL(`tel:${person.phone}`);
    else Alert.alert('No number', `No phone number for ${person.name}.`);
  };

  const handleChat = (person) => {
    if (person.phone) Linking.openURL(`sms:${person.phone}`);
    else Alert.alert('No number', `No phone number for ${person.name}.`);
  };

  const handleAlert = (person) => {
    Alert.alert(
      'Send alert?',
      `Send a safety alert to ${person.name}? They may receive a notification.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', onPress: () => Alert.alert('Sent', `Alert sent to ${person.name}.`) },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your Group</Text>
            <Text style={styles.appName}>SafeRound</Text>
          </View>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <Text style={styles.profileInitials}>ME</Text>
          </TouchableOpacity>
        </View>

        {/* View on map */}
        <TouchableOpacity style={styles.mapCard} onPress={handleViewMapPress} activeOpacity={0.8}>
          <View style={styles.mapCardContent}>
            <Text style={styles.mapCardIcon}>📍</Text>
            <View style={styles.mapCardText}>
              <Text style={styles.mapCardTitle}>View on map</Text>
              <Text style={styles.mapCardDesc}>See where everyone is</Text>
            </View>
            <Text style={styles.mapCardChevron}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Group members */}
        <Text style={styles.sectionTitle}>Group members</Text>

        {MOCK_GROUP.map((person) => (
          <View key={person.id} style={styles.memberCard}>
            <View style={styles.memberLeft}>
              <View style={[styles.memberAvatar, { backgroundColor: '#333' }]}>
                <Text style={styles.memberInitials}>{person.initials}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{person.name}</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: STATUS_COLORS[person.status] || STATUS_COLORS.safe },
                    ]}
                  />
                  <Text style={styles.statusLabel}>
                    {person.status === 'safe' ? 'Safe' : person.status === 'caution' ? 'Caution' : 'Alert'}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.actionIcons}>
              <TouchableOpacity
                onPress={() => handleChat(person)}
                style={styles.iconButton}
                accessibilityLabel={`Message ${person.name}`}
              >
                <Text style={styles.actionIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleCall(person)}
                style={styles.iconButton}
                accessibilityLabel={`Call ${person.name}`}
              >
                <Text style={styles.actionIcon}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleAlert(person)}
                style={styles.iconButton}
                accessibilityLabel={`Alert ${person.name}`}
              >
                <Text style={styles.actionIcon}>🔔</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    color: '#B0BEC5',
    fontSize: 16,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  profileInitials: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  mapCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333',
  },
  mapCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapCardIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  mapCardText: {
    flex: 1,
  },
  mapCardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  mapCardDesc: {
    color: '#9E9E9E',
    fontSize: 12,
    marginTop: 2,
  },
  mapCardChevron: {
    color: '#9E9E9E',
    fontSize: 24,
    fontWeight: '300',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  memberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  memberInitials: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusLabel: {
    color: '#9E9E9E',
    fontSize: 13,
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 10,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 20,
  },
});
