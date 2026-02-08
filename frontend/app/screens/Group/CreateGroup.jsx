import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const ContactItem = ({ initials }) => (
  <View style={styles.contactCard}>
    <View style={styles.avatarContainer}>
      <View style={styles.avatarCircle}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <Text style={styles.contactName}>Suggested Contact</Text>
    </View>
    <TouchableOpacity style={styles.addButton}>
      <Text style={styles.plusSymbol}>+</Text>
    </TouchableOpacity>
  </View>
);

const CreateGroupScreen = () => {
  return (
    <View style={styles.container}>
      {/* Background Orbs for Depth */}
      <View style={[styles.orb, styles.orbLarge]} />
      <View style={[styles.orb, styles.orbSmall]} />

      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Create a Group</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <TextInput 
              style={styles.searchInput}
              placeholder="Search Contacts"
              placeholderTextColor="rgba(255,255,255,0.6)"
            />
          </View>

          <Text style={styles.sectionLabel}>Suggested</Text>
          
          <ContactItem initials="SC" />
          <ContactItem initials="SC" />
          <ContactItem initials="SC" />
          <ContactItem initials="SC" />

          {/* Form Section */}
          <View style={styles.inputGroup}>
            <TextInput 
              style={styles.formInput}
              placeholder="Name Your Group"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
          
          </View>
        </ScrollView>

        {/* Footer Button */}
        <TouchableOpacity style={styles.mainButtonContainer}>
          <LinearGradient
            colors={['#BE5C5C', '#6E1F30']}
            style={styles.mainButton}
          >
            <Text style={styles.mainButtonText}>Create</Text>
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
    opacity: 0.6,
  },
  orbSmall: {
    width: 420,
    height: 420,
    backgroundColor: 'rgba(255, 201, 201, 0.26)',
    top: 130,
    left: -210,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    fontWeight: '200',
    fontFamily: 'Inter',
  },
  searchSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  searchInput: {
    color: 'white',
    fontSize: 14,
  },
  sectionLabel: {
    color: 'white',
    fontStyle: 'italic',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 10,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: 10,
    marginBottom: 15,
    height: 60,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 12,
  },
  contactName: {
    color: 'white',
    fontSize: 12,
    fontWeight: '300',
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
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 20,
    lineHeight: 22,
  },
  inputGroup: {
    marginTop: 20,
  },
  formInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    height: 47,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  formInputText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '200',
  },

  mainButtonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 200,
    height: 55,
  },
  mainButton: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateGroupScreen;
