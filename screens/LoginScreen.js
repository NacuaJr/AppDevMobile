import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const handleLogin = async () => {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) return Alert.alert('Login Failed', signInError.message);

    const userId = signInData.user.id;
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (userError) return Alert.alert('Error', 'Failed to verify user role.');

    if (userData.role !== role) {
      return Alert.alert(
        'Role Mismatch',
        `This account is registered as a ${userData.role}. Please switch role to continue.`
      );
    }

    navigation.replace(role === 'seller' ? 'SellerDashboard' : 'CustomerDashboard');
  };

  return (
    <ImageBackground
      source={require('../assets/food-background.jpg')}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}> FEASTBOOK </Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#ffdab9"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          placeholderTextColor="#ffdab9"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

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
          <Text style={styles.linkText}>Don’t have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  title: {
    fontSize: 30,
    color: '#FF8C42',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#FF8C42',
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    color: 'white',
    backgroundColor: 'rgba(255,165,0,0.1)',
    marginBottom: 15,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  roleButton: {
    color: 'white',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#FF8C42',
    borderRadius: 8,
    marginHorizontal: 5,
    fontSize: 14,
  },
  roleSelected: {
    backgroundColor: '#FF8C42',
    color: 'black',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF8C42',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#FF8C42',
    marginTop: 20,
    fontSize: 13,
  },
});
