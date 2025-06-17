import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { navigate } from '../utils/Navigation';
import { getUserProfile, saveUserProfile } from '../service/Storage';
import Colors from '../utils/Constants'; // Color scheme file

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
        'https://4a60-2400-adc5-124-2500-ddec-56ec-287f-f5e3.ngrok-free.app/api/auth/login',
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

      if (response.ok) {
        Alert.alert('Success', 'Login successful!');
        await saveUserProfile(data.user.id, data.token, data.user);
        navigate('Dashboard');
      } else {
        Alert.alert('Error', data.message || 'Failed to login.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const handleRegisterNavigation = () => {
    navigate('RegisterScreen');
  };

  return (
    <LinearGradient
      colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
      style={styles.gradientContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <LinearGradient
            colors={[Colors.primaryGradientStart, Colors.primaryGradientEnd]}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Login</Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>New here?</Text>
          <TouchableOpacity onPress={handleRegisterNavigation}>
            <Text style={styles.registerLink}> Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.textPrimary,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: Colors.backgroundWhite,
    color: Colors.textPrimary,
  },
  button: {
    width: '100%',
    borderRadius: 8,
    marginTop: 10,
  },
  buttonGradient: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  registerText: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  registerLink: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default LoginScreen;
