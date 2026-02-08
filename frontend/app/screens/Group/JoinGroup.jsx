import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/UserContext';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import MainLayout from '../../MainLayout';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const EXPO_PUBLIC_API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const GroupItem = ({ name, memberCount, selected, onPress }) => (
    <TouchableOpacity
        style={[styles.groupCard, selected && styles.groupCardSelected]}
        activeOpacity={0.85}
        onPress={onPress}
    >
        <View style={styles.groupInfo}>
            <Text style={styles.groupName} numberOfLines={1} ellipsizeMode="tail">{name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginLeft: 6 }}>({memberCount} members)</Text>
        </View>
        <View style={styles.addButton}>
            <Text style={styles.plusSymbol}>+</Text>
        </View>
    </TouchableOpacity>
);

// Removed old random group names. All group data now comes from MongoDB API.

const JoinGroupScreen = () => {
    const [search, setSearch] = useState("");
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setGroupName, leaveGroup, groupId } = useUser ? useUser() : { setGroupName: () => {}, leaveGroup: async () => {}, groupId: null };

    useEffect(() => {
        setLoading(true);
        fetch(`${EXPO_PUBLIC_API_URL}/groups/list`)
            .then(res => res.json())
            .then(data => {
                setGroups(Array.isArray(data.groups) ? data.groups : []);
            })
            .catch(() => setGroups([]))
            .finally(() => setLoading(false));
    }, []);

    const filteredGroups = groups.filter(g =>
        g.code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <MainLayout>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
                <View style={styles.container}>
                    {/* Background Orbs */}
                    <View style={[styles.orb, styles.orbLarge]} />
                    <View style={[styles.orb, styles.orbGlass]} />

                    <SafeAreaView style={[styles.content, {paddingHorizontal: 24, marginTop: 20}]}> 
                        <View style={styles.header}>
                            <Text style={styles.title}>Join a Group</Text>
                        </View>

                        {/* Search Bar */}
                        <View style={styles.searchContainer}>
                            <View style={styles.searchIcon} />
                            <TextInput 
                                style={styles.searchInput}
                                placeholder="Search Groups"
                                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>

                        {/* Group Results Container */}
                                                <View style={styles.resultsContainer}>
                                                    <SafeAreaView style={{flex: 1}}>
                                                        <ScrollView
                                                            contentContainerStyle={{paddingBottom: 24}}
                                                            showsVerticalScrollIndicator={true}
                                                            indicatorStyle="white"
                                                        >
                                                            {loading ? (
                                                                <Text style={{ color: 'white', textAlign: 'center', marginTop: 16 }}>Loading groups...</Text>
                                                            ) : filteredGroups.length > 0 ? (
                                                                filteredGroups.map((group) => (
                                                                    <GroupItem
                                                                        key={group.code}
                                                                        name={group.code}
                                                                        memberCount={group.member_count}
                                                                        selected={selectedGroup === group.code}
                                                                        onPress={() => setSelectedGroup(group.code)}
                                                                    />
                                                                ))
                                                            ) : (
                                                                <Text style={{ color: 'white', textAlign: 'center', marginTop: 16 }}>No groups found.</Text>
                                                            )}
                                                        </ScrollView>
                                                    </SafeAreaView>
                                                </View>

                        {/* Join Button */}
                        <TouchableOpacity
                            style={styles.joinButtonWrapper}
                            disabled={!selectedGroup}
                            onPress={async () => {
                                if (selectedGroup) {
                                    if (groupId && leaveGroup) {
                                        await leaveGroup();
                                    }
                                    if (setGroupName) setGroupName(selectedGroup);
                                    router.push('/screens/Dashboard/Dashboard');
                                }
                            }}
                        >
                            <LinearGradient
                                colors={['#BE5C5C', '#6E1F30']}
                                style={styles.joinButton}
                            >
                                <Text style={[styles.joinButtonText, { opacity: selectedGroup ? 1 : 0.5 }]}>Join Group</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>
            </TouchableWithoutFeedback>
        </MainLayout>
    );
};

        const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#7F3B4A',
        },
        orb: {
            position: 'absolute',
            borderRadius: 999,
        },
        orbLarge: {
            width: 600,
            height: 600,
            backgroundColor: '#B4524C',
            top: 125,
            left: -220,
            opacity: 0.8,
        },
        orbGlass: {
            width: 420,
            height: 420,
            backgroundColor: 'rgba(255, 201, 201, 0.2)',
            top: 130,
            left: -210,
        },
        content: {
            flex: 1,
            paddingHorizontal: 30,
        },
        header: {
            marginTop: 10,
            marginBottom: 18,
            alignItems: 'center',
        },
        title: {
            fontSize: 24,
            color: 'white',
            fontWeight: '200',
            letterSpacing: 0.5,
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(40, 20, 30, 0.38)', // Darker, slightly purple-brown
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.22)',
            height: 45,
            paddingHorizontal: 15,
            marginBottom: 25,
            width: '85%', // Reduce width
            alignSelf: 'center',
        },
        searchInput: {
            flex: 1,
            color: 'white',
            fontSize: 14,
            marginLeft: 10,
        },
        searchIcon: {
            width: 14,
            height: 14,
            backgroundColor: 'white', // Placeholder for search icon
            borderRadius: 2,
        },
        sectionLabel: {
            color: 'white',
            fontStyle: 'italic',
            fontSize: 12,
            marginBottom: 15,
            opacity: 0.9,
        },
        listContainer: {
            gap: 15,
        },
        resultsContainer: {
            marginTop: 10,
            marginBottom: 20,
            gap: 15,
            alignItems: 'center',
            backgroundColor: 'rgba(60, 30, 40, 0.22)', // More opaque, slightly reddish
            borderRadius: 18,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.22)',
            paddingVertical: 16,
            paddingHorizontal: 8,
            width: '90%',
            alignSelf: 'center',
            flex: 1,
            minHeight: 220,
            maxHeight: 340,
        },
        groupCard: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            paddingHorizontal: 15,
            height: 60,
            width: '85%', // Reduce width
            alignSelf: 'center',
            marginVertical: 10,
        },
        groupCardSelected: {
            backgroundColor: 'rgba(190, 92, 92, 0.28)',
            borderColor: '#BE5C5C',
        },
        groupInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        // iconCircle and placeholderIcon styles removed
        groupName: {
            color: 'rgba(255,255,255,0.95)',
            fontSize: 14,
            fontWeight: '500',
            flex: 1,
            marginRight: 8,
            overflow: 'hidden',
        },
        addButton: {
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
        },
        plusSymbol: {
            color: 'rgba(255, 255, 255, 0.6)',
            fontSize: 22,
            fontWeight: '300',
            marginTop: -2,
        },
        joinButtonWrapper: {
            marginTop: 40,
            alignSelf: 'center',
            width: 160, // Reduce width
            height: 57,
        },
        joinButton: {
            flex: 1,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        joinButtonText: {
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
        },
        });

        export default JoinGroupScreen;
