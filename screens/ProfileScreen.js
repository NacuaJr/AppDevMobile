import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image, 
  SafeAreaView,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    bookings: 0,
    services: 0,
    rating: 4.8
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // In a real app, you would fetch these from your database
      setStats({
        bookings: 24,
        services: 5,
        rating: 4.8
      });
    };
    
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) {
            Alert.alert('Error', 'Failed to logout.');
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Text style={styles.userName}>
            {user?.user_metadata?.full_name || 'User Name'}
          </Text>
          <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.bookings}</Text>
              <Text style={styles.statLabel}>Bookings</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.services}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.rating}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="settings-outline" size={24} color="#FF6B35" />
            </View>
            <Text style={styles.menuText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A373" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="notifications-outline" size={24} color="#FF6B35" />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A373" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="help-circle-outline" size={24} color="#FF6B35" />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A373" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Ionicons name="document-text-outline" size={24} color="#FF6B35" />
            </View>
            <Text style={styles.menuText}>Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#D4A373" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#E15554" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF9F2',
  },
  container: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FF6B35',
    marginHorizontal: -16,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    color: '#FFF',
    fontWeight: '700',
    fontFamily: 'sans-serif-condensed',
  },
  headerRightPlaceholder: {
    width: 28,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#FFE5D4',
  },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#FF6B35',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#5A3921',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#8B4513',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#D4A373',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#7A5C3C',
  },
  menuSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 30,
    shadowColor: '#D4A373',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6DD',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#5A3921',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E15554',
    marginHorizontal: 20,
  },
  logoutText: {
    color: '#E15554',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
});