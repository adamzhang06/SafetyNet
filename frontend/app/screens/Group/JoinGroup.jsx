                
                
        import React from 'react';
        import { 
        StyleSheet, 
        View, 
        Text, 
        TextInput, 
        TouchableOpacity, 
        SafeAreaView, 
        Dimensions 
        } from 'react-native';
        import { LinearGradient } from 'expo-linear-gradient';

        const { width } = Dimensions.get('window');

        const GroupItem = ({ name }) => (
        <View style={styles.groupCard}>
            <View style={styles.groupInfo}>
            <View style={styles.iconCircle}>
                {/* Replace with your specific SVG/Icon component */}
                <View style={styles.placeholderIcon} />
            </View>
            <Text style={styles.groupName} numberOfLines={1}>{name}</Text>
            </View>
            <TouchableOpacity style={styles.addButton}>
            <Text style={styles.plusSymbol}>+</Text>
            </TouchableOpacity>
        </View>
        );

        const JoinGroupScreen = () => {
        return (
            <View style={styles.container}>
            {/* Background Orbs */}
            <View style={[styles.orb, styles.orbLarge]} />
            <View style={[styles.orb, styles.orbGlass]} />

            <SafeAreaView style={styles.content}>
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
                />
                </View>

                <Text style={styles.sectionLabel}>Suggested ✨</Text>

                <View style={styles.listContainer}>
                <GroupItem name="Responsibly Drinking Baddies" />
                <GroupItem name="Harry’s Loyal Customers" />
                <GroupItem name="Roomies" />
                </View>

                {/* Join Button */}
                <TouchableOpacity style={styles.joinButtonWrapper}>
                <LinearGradient
                    colors={['#BE5C5C', '#6E1F30']}
                    style={styles.joinButton}
                >
                    <Text style={styles.joinButtonText}>Join Group</Text>
                </LinearGradient>
                </TouchableOpacity>
            </SafeAreaView>
            </View>
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
            marginTop: 40,
            marginBottom: 30,
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
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: 20,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            height: 45,
            paddingHorizontal: 15,
            marginBottom: 25,
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
        },
        groupInfo: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
        },
        iconCircle: {
            width: 38,
            height: 38,
            borderRadius: 19,
            borderWidth: 1,
            borderColor: 'white',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        placeholderIcon: {
            width: 20,
            height: 18,
            backgroundColor: 'white',
            borderRadius: 2,
        },
        groupName: {
            color: 'white',
            fontSize: 12,
            fontWeight: '300',
            flex: 1,
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
            width: 196,
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
