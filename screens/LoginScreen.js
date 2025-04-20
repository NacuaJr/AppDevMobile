import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default to customer

  const handleLogin = async () => {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
  
    if (signInError) {
      return Alert.alert('Login Failed', signInError.message);
    }
  
    const userId = signInData.user.id;
  
    // Fetch role from 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
  
    if (userError) {
      return Alert.alert('Error', 'Failed to verify user role.');
    }
  
    if (userData.role !== role) {
      return Alert.alert(
        'Role Mismatch',
        `This account is registered as a ${userData.role}. Please switch role to continue.`
      );
    }
  
    // Navigate based on correct role
    navigation.replace(role === 'seller' ? 'SellerDashboard' : 'CustomerDashboard');
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {/* Role Selection */}
      <View style={styles.roleContainer}>
        <TouchableOpacity onPress={() => setRole('customer')}>
          <Text style={[styles.roleButton, role === 'customer' && styles.roleSelected]}>
            I'm a Customer
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('seller')}>
          <Text style={[styles.roleButton, role === 'seller' && styles.roleSelected]}>
            I'm a Seller
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register', { role })}>
        <Text style={styles.linkText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Fills the whole screen
    backgroundColor: 'black', // Black background
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    padding: 20, // Padding for spacing
  },
  title: {
    fontSize: 28, // Large title text
    color: 'white', // White text
    marginBottom: 20, // Space below title
  },
  input: {
    width: '100%', // Full width input
    height: 50, // Consistent input height
    borderColor: 'white', // White border
    borderWidth: 1, // Border thickness
    borderRadius: 8, // Rounded corners
    paddingHorizontal: 10, // Padding inside input
    color: 'white', // Input text color
    marginBottom: 15, // Space between inputs
  },
  roleContainer: {
    flexDirection: 'row', // Side-by-side buttons
    justifyContent: 'space-between', // Space out buttons
    width: '100%', // Full width container
    marginBottom: 15, // Space below role selection
  },
  roleButton: {
    color: 'white', // White text
    padding: 10, // Touchable padding
    borderWidth: 1, // Show border
    borderColor: 'white', // White border
    borderRadius: 8, // Rounded corners
    marginHorizontal: 5, // Space between buttons
  },
  roleSelected: {
    backgroundColor: 'white', // White background for selected
    color: 'black', // Black text for selected
  },
  button: {
    backgroundColor: 'white', // White button
    padding: 15, // Button padding
    borderRadius: 8, // Rounded corners
    marginTop: 10, // Space above button
    width: '100%', // Full width button
  },
  buttonText: {
    textAlign: 'center', // Center the text
    color: 'black', // Black button text
    fontWeight: 'bold', // Bold text
  },
  linkText: {
    color: 'white', // White link text
    marginTop: 20, // Space above link
  },
});
