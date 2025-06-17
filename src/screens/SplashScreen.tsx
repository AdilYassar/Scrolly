import React, { useEffect, useMemo } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { navigate } from '../utils/Navigation';


const SplashScreen = () => {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);

useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000, // 2 seconds for the animation
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      navigate('LoginScreen'); // Navigate to Dashboard after 3 seconds
    }, 3000);

    return () => clearTimeout(timer); // Clean up the timer
  }, [fadeAnim, ]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ ...styles.logoContainer, opacity: fadeAnim }}>
        <Text style={styles.logoText}>Scrolly</Text>
      </Animated.View>
      <Text style={styles.tagline}>Explore. Share. Enjoy.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default SplashScreen;
