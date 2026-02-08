import React, { useEffect } from 'react';
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
import { useUser } from '../../context/UserContext';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const STATUS_COLORS = { safe: '#4CAF50', caution: '#FFC107', alert: '#F44336' };

export default function GroupScreen() {
  const {
    userId,
    firstName,
    lastName,
    groupId,
    groupCode,
    groupMembers,
    refreshGroupMembers,
  } = useUser();

  useEffect(() => {
    if (groupId) refreshGroupMembers();
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    const interval = setInterval(refreshGroupMembers, 15000);
    return () => clearInterval(interval);
  }, [groupId, refreshGroupMembers]);

  const handleProfilePress = () => router.push('/profile');
  const handleViewMapPress = () => router.push('/dashboard/group-map');

  const handleCall = (person) => {
    const phone = person.phone || person.primary_contact;
    if (phone) Linking.openURL(`tel:${phone}`);
    else Alert.alert('No number', `No phone number for ${person.name}.`);
  };

  const handleChat = (person) => {
    const phone = person.phone || person.primary_contact;
    if (phone) Linking.openURL(`sms:${phone}`);
    else Alert.alert('No number', `No phone number for ${person.name}.`);
  };

  const displayName = [firstName, lastName].filter(Boolean).join(' ') || 'Me';
  const initials = (firstName?.[0] || '') + (lastName?.[0] || '') || 'ME';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Your Group</Text>
            <Text style={styles.appName}>BarBabes</Text>
          </View>
          <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
            <Text style={styles.profileInitials}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {!groupId ? (
          <>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/group/create')}
              >
                <Text style={styles.primaryButtonText}>Create Group</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/group/join')}
              >
                <Text style={styles.secondaryButtonText}>Join Group</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>Create a group and share the 6-digit code, or enter a code to join.</Text>
          </>
        ) : (
          <>
            {groupCode ? (
              <View style={styles.codeCard}>
                <Text style={styles.codeLabel}>Group code</Text>
                <Text style={styles.codeValue}>{groupCode}</Text>
              </View>
            ) : null}
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

            <Text style={styles.sectionTitle}>Group members</Text>
            {(groupMembers || []).length === 0 ? (
              <Text style={styles.emptyText}>No members yet. Share the code to invite.</Text>
            ) : (
              (groupMembers || []).map((person) => (
                <View key={person.user_id} style={styles.memberCard}>
                  <View style={styles.memberLeft}>
                    <View style={[styles.memberAvatar, { backgroundColor: '#333' }]}>
                      <Text style={styles.memberInitials}>
                        {(person.first_name?.[0] || '') + (person.last_name?.[0] || '') || '?'}
                      </Text>
                    </View>
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{person.name || 'Unknown'}</Text>
                      <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS.safe }]} />
                        <Text style={styles.statusLabel}>Safe</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.actionIcons}>
                    <TouchableOpacity onPress={() => handleChat(person)} style={styles.iconButton}>
                      <Text style={styles.actionIcon}>💬</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleCall(person)} style={styles.iconButton}>
                      <Text style={styles.actionIcon}>📞</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
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
  buttonGroup: {
    gap: 12,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#7F3B4A',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#333',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  secondaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  hint: {
    color: '#9E9E9E',
    fontSize: 14,
    textAlign: 'center',
  },
  codeCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  codeLabel: {
    color: '#9E9E9E',
    fontSize: 12,
    marginBottom: 4,
  },
  codeValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 6,
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
  emptyText: {
    color: '#9E9E9E',
    fontSize: 14,
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
