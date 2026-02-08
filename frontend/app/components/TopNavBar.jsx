import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '../context/UserContext';

const TopNavbar = ({ imageUri, onNotificationPress }) => {
  const { firstName, photoUri, groupName, leaveGroup } = useUser();
  const WomanSilhouette = require('../assets/woman_silhouette.png');
  let displayUri = photoUri;
  if (!displayUri) {
    displayUri = Image.resolveAssetSource(WomanSilhouette).uri;
  }
  // Always show a label: firstName or placeholder
  const displayName = firstName && firstName.trim() ? firstName : 'Your Name';
  return (
    <View style={styles.header}>
      <View style={styles.userInfo}>
        <View style={styles.avatarWrapper}>
          <Image 
            source={{ uri: displayUri }}
            style={styles.avatar} 
          />
        </View>
        <Text style={styles.userName}>{displayName}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={styles.groupName} numberOfLines={1} ellipsizeMode="tail">{groupName ? groupName : 'Your Group'}</Text>
        <TouchableOpacity onPress={onNotificationPress} style={styles.notificationButton}>
           <Image 
              source={{ uri: 'https://img.icons8.com/ios-filled/50/ffffff/menu--v1.png' }} 
              style={styles.iconImage}
           />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60, // Fixed height for consistency
    paddingHorizontal: 24,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationButton: {
    padding: 8,
  },
  iconImage: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  groupName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
    maxWidth: 80,
    textAlign: 'center',
    overflow: 'hidden',
  },
  // leaveButton and leaveButtonText styles removed
});

export default TopNavbar;