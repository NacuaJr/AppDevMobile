import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { supabase } from '../supabase';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const role = route.params?.role || 'customer';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return Alert.alert('Signup Failed', error.message);

    const user = data.user;
    if (!user)
      return Alert.alert('Signup Success', 'Check your email to confirm your account.');

    const userId = user.id;

    const { error: insertUserError } = await supabase.from('users').insert([
      { id: userId, email, password, role },
    ]);
    if (insertUserError) return Alert.alert('Error', insertUserError.message);

    if (role === 'seller') {
      const { error: sellerError } = await supabase.from('sellers').insert([
        { id: userId, business_name: businessName, location, bio, contact_number: contactNumber },
      ]);
      if (sellerError) return Alert.alert('Error saving seller info', sellerError.message);
      navigation.replace('SellerDashboard');
    } else {
      const { error: customerError } = await supabase.from('customers').insert([
        { id: userId, full_name: fullName, address, contact_number: contactNumber },
      ]);
      if (customerError) return Alert.alert('Error saving customer info', customerError.message);
      navigation.replace('CustomerDashboard');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register as {role === 'seller' ? 'Seller' : 'Customer'}</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <TextInput
        placeholder="Contact Number"
        placeholderTextColor="#999"
        value={contactNumber}
        onChangeText={setContactNumber}
        style={styles.input}
      />

      {role === 'seller' ? (
        <>
          <TextInput
            placeholder="Business Name"
            placeholderTextColor="#999"
            value={businessName}
            onChangeText={setBusinessName}
            style={styles.input}
          />
          <TextInput
            placeholder="Location"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
            style={styles.input}
          />
          <TextInput
            placeholder="Bio"
            placeholderTextColor="#999"
            value={bio}
            onChangeText={setBio}
            style={styles.input}
          />
        </>
      ) : (
        <>
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
          />
          <TextInput
            placeholder="Address"
            placeholderTextColor="#999"
            value={address}
            onChangeText={setAddress}
            style={styles.input}
          />
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
    flexGrow: 1,
    backgroundColor: '#9E7A6A', // subtle warm background
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderColor: '#FF6B00',
    borderWidth: 1.2,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: '#333',
    marginBottom: 14,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  button: {
    backgroundColor: '#FF6B00',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
