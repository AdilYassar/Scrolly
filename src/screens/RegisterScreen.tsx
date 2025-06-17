import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { navigate } from '../utils/Navigation';


const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);


  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
    });

    if (result.assets && result.assets.length > 0) {
      setImage(result.assets[0]);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append(
      'profilePic',
      image
        ? {
            uri: image.uri,
            type: image.type,
            name: image.fileName,
          }
        : ''
    );

    try {
      const response = await fetch(
        'https://001d-2400-adc5-124-2500-ddec-56ec-287f-f5e3.ngrok-free.app/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'User registered successfully!');
        console.log('User Data:', data.user);
        // Navigate to LoginScreen
        navigate('LoginScreen');
      } else {
        Alert.alert('Error', data.message || 'Failed to register.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
      />
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
      {image && (
        <Image source={{ uri: image.uri }} style={styles.imagePreview} />
      )}
      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePicker}>
        <Text style={styles.imagePickerText}>Choose Profile Picture</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
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
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  imagePicker: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
