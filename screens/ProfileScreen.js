import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { supabase } from '../supabase';

export default function ProfileScreen({ navigation }) {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Error', 'Failed to logout.');
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Full height
    backgroundColor: 'black', // Black background
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    padding: 16, // Padding around content
  },
  title: {
    fontSize: 24, // Big profile title
    color: 'white', // White text
    marginBottom: 20, // Space below title
  },
});
