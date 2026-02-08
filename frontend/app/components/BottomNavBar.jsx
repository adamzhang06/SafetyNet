import React from 'react';
import { useRouter } from 'expo-router';
import { View, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const BottomNavBar = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      {/* Home Icon */}
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('../Dashboard/Dashboard')}>
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/home.png' }} style={styles.icon} />
      </TouchableOpacity>
      
      {/* Map Icon (was Stats/Graph) */}
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('../Dashboard/GroupMapScreen')}>
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/map.png' }} style={styles.icon} />
      </TouchableOpacity>

      {/* Phone Icon (was Group) */}
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('../Dashboard/ContextList')}>
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/phone.png' }} style={styles.icon} />
      </TouchableOpacity>
      
      {/* Profile Icon */}
      <TouchableOpacity style={styles.navItem} onPress={() => router.push('../SobrietyTests/ReactionTest')}>
        <Image source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/settings.png' }} style={styles.icon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    height: 80,
    backgroundColor: '#7F3B4A',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 20, // Padding for safe area on newer iPhones
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -35,
    width: '100%',
    zIndex: 100,
  },
  navItem: {
    padding: 10,
  },
  icon: {
    width: 28,
    height: 28,
    tintColor: 'white',
    opacity: 0.8,
  },
});

export default BottomNavBar;