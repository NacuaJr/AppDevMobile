import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '../supabase';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const role = route.params?.role || 'customer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Common
  const [contactNumber, setContactNumber] = useState('');

  // Seller fields
  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  // Customer fields
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) {
      return Alert.alert('Signup Failed', error.message);
    }
  
    const user = data.user;
  
    if (!user) {
      return Alert.alert('Signup Success', 'Please check your email to confirm your account before logging in.');
    }
  
    const userId = user.id;
  
    // Insert into 'users' table
    const { error: insertUserError } = await supabase.from('users').insert([
      { id: userId, email, password, role }
    ]);
  
    if (insertUserError) {
      return Alert.alert('Error', insertUserError.message);
    }
    
    if (role === 'seller') {
      const { error: sellerError } = await supabase.from('sellers').insert([
        {
          id: userId,
          business_name: businessName,
          location,
          bio,
          contact_number: contactNumber
        }
      ]);
      if (sellerError) return Alert.alert('Error saving seller info', sellerError.message);
      navigation.replace('SellerDashboard');
    } else {
      const { error: customerError } = await supabase.from('customers').insert([
        {
          id: userId,
          full_name: fullName,
          address,
          contact_number: contactNumber
        }
      ]);
      if (customerError) return Alert.alert('Error saving customer info', customerError.message);
      navigation.replace('CustomerDashboard');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register as {role === 'seller' ? 'Seller' : 'Customer'}</Text>

      <TextInput placeholder="Email" placeholderTextColor="#888" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <TextInput placeholder="Contact Number" placeholderTextColor="#888" value={contactNumber} onChangeText={setContactNumber} style={styles.input} />

      {role === 'seller' ? (
        <>
          <TextInput placeholder="Business Name" placeholderTextColor="#888" value={businessName} onChangeText={setBusinessName} style={styles.input} />
          <TextInput placeholder="Location" placeholderTextColor="#888" value={location} onChangeText={setLocation} style={styles.input} />
          <TextInput placeholder="Bio" placeholderTextColor="#888" value={bio} onChangeText={setBio} style={styles.input} />
        </>
      ) : (
        <>
          <TextInput placeholder="Full Name" placeholderTextColor="#888" value={fullName} onChangeText={setFullName} style={styles.input} />
          <TextInput placeholder="Address" placeholderTextColor="#888" value={address} onChangeText={setAddress} style={styles.input} />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1, // Scrollable container
    backgroundColor: 'black', // App-wide dark theme
    padding: 20, // Inner padding for spacing
    alignItems: 'center', // Center horizontally
  },
  title: {
    fontSize: 26, // Large heading
    color: 'white', // White text
    marginVertical: 20, // Space above and below
  },
  input: {
    width: '100%', // Full width
    height: 50, // Input height
    borderColor: 'white', // Input border
    borderWidth: 1, // Border thickness
    borderRadius: 8, // Rounded input corners
    paddingHorizontal: 10, // Internal input padding
    color: 'white', // White input text
    marginBottom: 15, // Gap between inputs
  },
  button: {
    backgroundColor: 'white', // White button
    padding: 15, // Button padding
    borderRadius: 8, // Rounded button
    width: '100%', // Full width
    marginTop: 10, // Top spacing
  },
  buttonText: {
    textAlign: 'center', // Centered text
    color: 'black', // Black button text
    fontWeight: 'bold', // Emphasized label
  },
});
