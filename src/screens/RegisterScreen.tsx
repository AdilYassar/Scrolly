import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as ImagePicker from 'react-native-image-picker';
import { navigate } from '../utils/Navigation';
import Colors from '../utils/Constants';
import { BASE_URL } from '../utils/config';

const { width, height } = Dimensions.get('window');

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleImagePicker = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      includeBase64: true,
      quality: 0.7,
    });

    if (result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      setImage(selectedImage);

      let mimeType = selectedImage.type || 'image/jpeg';
      const base64String = `data:${mimeType};base64,${selectedImage.base64}`;
      setImageBase64(base64String);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const requestBody = {
      name,
      email,
      password,
      profilePic: imageBase64,
    };

    try {
      const response = await fetch(
        `${BASE_URL}/api/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'User registered successfully!');
        navigate('LoginScreen');
      } else {
        Alert.alert('Error', data.message || 'Failed to register.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    navigate('LoginScreen');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#4facfe', '#00f2fe', '#a8edea']}
        locations={[0, 0.6, 1]}
        style={styles.gradientContainer}
      >
        {/* Animated floating elements */}
        <View style={[styles.floatingElement, styles.element1]} />
        <View style={[styles.floatingElement, styles.element2]} />
        <View style={[styles.floatingElement, styles.element3]} />
        <View style={[styles.floatingElement, styles.element4]} />

        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Animated.View 
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Glass morphism card */}
            <View style={styles.glassCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.title}>Join Us Today</Text>
                <Text style={styles.subtitle}>Create your account and start your journey</Text>
              </View>

              {/* Profile Picture Section */}
              <View style={styles.profileSection}>
                <TouchableOpacity 
                  style={styles.imagePicker} 
                  onPress={handleImagePicker}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.imagePickerGradient}
                  >
                    {image ? (
                      <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                    ) : (
                      <View style={styles.imagePickerContent}>
                        <Text style={styles.cameraIcon}>📸</Text>
                        <Text style={styles.imagePickerText}>Add Photo</Text>
                      </View>
                    )}
                  </LinearGradient>
                  <View style={styles.imagePickerRing} />
                </TouchableOpacity>
              </View>

              {/* Input Fields */}
              <View style={styles.inputContainer}>
                <View style={[
                  styles.inputWrapper,
                  nameFocused && styles.inputWrapperFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>👤</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor="#000"
                    value={name}
                    onChangeText={setName}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
                </View>

                <View style={[
                  styles.inputWrapper,
                  emailFocused && styles.inputWrapperFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>✉</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor="#000"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>

                <View style={[
                  styles.inputWrapper,
                  passwordFocused && styles.inputWrapperFocused
                ]}>
                  <View style={styles.inputIconContainer}>
                    <Text style={styles.inputIcon}>🔒</Text>
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#000"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                  />
                </View>
              </View>

              {/* Register Button */}
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleRegister}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#ff6b6b', '#4ecdc4', '#45b7d1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>Create Account</Text>
                  <View style={styles.buttonShine} />
                </LinearGradient>
              </TouchableOpacity>

              {/* Back to Login */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account?</Text>
                <TouchableOpacity 
                  onPress={handleBackToLogin}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loginLink}> Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.backgroundLight,
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.08,
    backgroundColor: Colors.backgroundWhite,
  },
  element1: {
    width: 80,
    height: 80,
    top: 100,
    left: 30,
  },
  element2: {
    width: 120,
    height: 120,
    top: 200,
    right: 20,
  },
  element3: {
    width: 60,
    height: 60,
    bottom: 200,
    left: 50,
  },
  element4: {
    width: 100,
    height: 100,
    bottom: 100,
    right: 40,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: Colors.backgroundLight,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: Colors.backgroundWhite,
  },
  glassCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Glass effect remains the same
    borderRadius: 28,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    shadowColor: Colors.primaryGradientEnd,
    shadowOffset: {
      width: 0,
      height: 25,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 25,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  imagePicker: {
    width: 130,
    height: 130,
    borderRadius: 65,
    position: 'relative',
    backgroundColor: Colors.backgroundLight,
  },
  imagePickerGradient: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.borderColor,
  },
  imagePickerRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: Colors.borderColor,
    top: -5,
    left: -5,
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 32,
    color: Colors.iconNotification,
    marginBottom: 6,
  },
  imagePickerText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
    borderRadius: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  inputWrapperFocused: {
    backgroundColor: Colors.backgroundWhite,
    borderColor: Colors.primaryGradientEnd,
  },
  inputIconContainer: {
    paddingLeft: 20,
    paddingRight: 12,
  
  },
  inputIcon: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    paddingRight: 20,
    fontSize: 16,
    color: '000',
    fontWeight: '500',
  },
  button: {
    width: '100%',
    borderRadius: 18,
    marginBottom: 24,
    shadowColor: Colors.primaryGradientStart,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  buttonGradient: {
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  buttonText: {
    color: Colors.backgroundWhite,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  buttonShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 50,
    height: '100%',
    backgroundColor: Colors.backgroundWhite,
    transform: [{ skewX: '-20deg' }],
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  loginLink: {
    color: Colors.primaryGradientStart,
    fontWeight: '700',
    fontSize: 16,
    textDecorationLine: 'underline',
    textDecorationColor: Colors.primaryGradientStart,
  },
});


export default RegisterScreen;