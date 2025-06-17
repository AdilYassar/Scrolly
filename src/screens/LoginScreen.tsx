import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { navigate } from '../utils/Navigation';
import { getUserProfile, saveUserProfile } from '../service/Storage';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (email.trim() === '' || password.trim() === '') {
      Alert.alert('Error', 'Please fill in both email and password fields.');
      return;
    }

    try {
      const response = await fetch(
        'https://001d-2400-adc5-124-2500-ddec-56ec-287f-f5e3.ngrok-free.app/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      console.log('Full API Response:', data); // Log the complete response

      if (response.ok) {
        Alert.alert('Success', 'Login successful!');
        console.log('User Data from API:', data.user);
        console.log('Token from API:', data.token);

        // Save user data to AsyncStorage - Fix the data extraction
        // Your backend returns: { user: { id, name, email, profilePic }, token }
        await saveUserProfile(data.user.id, data.token, data.user); // Pass the complete user object
        console.log('User profile saved to AsyncStorage.');

        // Read and log saved data from AsyncStorage
        const savedUserData = await getUserProfile();
        console.log('Saved User Data from AsyncStorage:', savedUserData);

        // Log individual components for debugging
        console.log('Saved User ID:', savedUserData?.userId);
        console.log('Saved Token:', savedUserData?.token);
        console.log('Saved User Info:', savedUserData?.user);

        // Navigate to Dashboard
        navigate('Dashboard');
      } else {
        console.log('Login failed with response:', data);
        Alert.alert('Error', data.message || 'Failed to login.');
      }
    } catch (error) {
      console.error('Login Error Details:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const handleRegisterNavigation = () => {
    navigate('RegisterScreen');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>New here?</Text>
        <TouchableOpacity onPress={handleRegisterNavigation}>
          <Text style={styles.registerLink}> Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
    color: '#333',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  registerText: {
    color: '#333',
    fontSize: 14,
  },
  registerLink: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default LoginScreen;