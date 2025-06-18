import React, { useEffect, useMemo } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions, StatusBar } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { navigate } from '../utils/Navigation';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useMemo(() => new Animated.Value(0), []);
  const scaleAnim = useMemo(() => new Animated.Value(0.3), []);
  const slideAnim = useMemo(() => new Animated.Value(50), []);
  const rotateAnim = useMemo(() => new Animated.Value(0), []);
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  const taglineAnim = useMemo(() => new Animated.Value(0), []);
  const orbAnim1 = useMemo(() => new Animated.Value(0), []);
  const orbAnim2 = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    // Create a complex animation sequence
    const logoSequence = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]);

    // Rotating animation for the logo
    const rotateSequence = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    );

    // Pulsing animation
    const pulseSequence = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Tagline animation (delayed)
    const taglineSequence = Animated.timing(taglineAnim, {
      toValue: 1,
      duration: 800,
      delay: 600,
      useNativeDriver: true,
    });

    // Floating orbs animation
    const orbSequence1 = Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim1, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    const orbSequence2 = Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim2, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim2, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    );

    // Start all animations
    logoSequence.start();
    rotateSequence.start();
    pulseSequence.start();
    taglineSequence.start();
    orbSequence1.start();
    orbSequence2.start();

    const timer = setTimeout(() => {
      navigate('LoginScreen');
    }, 3000);

    return () => {
      clearTimeout(timer);
      rotateSequence.stop();
      pulseSequence.stop();
      orbSequence1.stop();
      orbSequence2.stop();
    };
  }, [fadeAnim, scaleAnim, slideAnim, rotateAnim, pulseAnim, taglineAnim, orbAnim1, orbAnim2]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orbTranslateY1 = orbAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const orbTranslateX1 = orbAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const orbTranslateY2 = orbAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25],
  });

  const orbTranslateX2 = orbAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#4BA1BBFF', '#F0F9BDFF']}
        locations={[0, 1]}
        style={styles.container}
      >
        {/* Animated floating orbs */}
        <Animated.View 
          style={[
            styles.floatingOrb1,
            {
              transform: [
                { translateY: orbTranslateY1 },
                { translateX: orbTranslateX1 },
                { scale: pulseAnim }
              ]
            }
          ]}
        />
        
        <Animated.View 
          style={[
            styles.floatingOrb2,
            {
              transform: [
                { translateY: orbTranslateY2 },
                { translateX: orbTranslateX2 },
                { scale: pulseAnim }
              ]
            }
          ]}
        />

        <Animated.View 
          style={[
            styles.floatingOrb3,
            {
              transform: [{ rotate: spin }]
            }
          ]}
        />

        <Animated.View 
          style={[
            styles.floatingOrb4,
            {
              transform: [{ rotate: spin }, { scale: pulseAnim }]
            }
          ]}
        />

        {/* Main content container */}
        <View style={styles.contentContainer}>
          {/* Logo container with glass morphism effect */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                  { scale: pulseAnim }
                ]
              }
            ]}
          >
            {/* Glowing background effect */}
            <View style={styles.glowEffect} />
            
            {/* Logo text with gradient effect simulation */}
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoText}>Scrolly</Text>
              <View style={styles.logoUnderline} />
            </View>
            
            {/* Decorative elements */}
            <View style={styles.decorativeContainer}>
              <View style={[styles.decorativeDot, styles.dot1]} />
              <View style={[styles.decorativeDot, styles.dot2]} />
              <View style={[styles.decorativeDot, styles.dot3]} />
            </View>
          </Animated.View>

          {/* Tagline with fade-in animation */}
          <Animated.View 
            style={[
              styles.taglineContainer,
              {
                opacity: taglineAnim,
                transform: [
                  { 
                    translateY: taglineAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    })
                  }
                ]
              }
            ]}
          >
            <Text style={styles.tagline}>Explore. Share. Enjoy.</Text>
            <View style={styles.taglineAccent} />
          </Animated.View>

          {/* Loading indicator */}
          <Animated.View 
            style={[
              styles.loadingContainer,
              {
                opacity: taglineAnim,
              }
            ]}
          >
            <View style={styles.loadingBar}>
              <Animated.View 
                style={[
                  styles.loadingProgress,
                  {
                    transform: [{ scaleX: pulseAnim }]
                  }
                ]}
              />
            </View>
            <Text style={styles.loadingText}>Loading your experience...</Text>
          </Animated.View>
        </View>

        {/* Bottom decorative wave */}
        <View style={styles.bottomWave}>
          <View style={styles.wave1} />
          <View style={styles.wave2} />
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  floatingOrb1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: height * 0.15,
    right: width * 0.1,
  },
  floatingOrb2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: height * 0.25,
    left: width * 0.15,
  },
  floatingOrb3: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: height * 0.3,
    left: width * 0.8,
  },
  floatingOrb4: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    bottom: height * 0.4,
    right: width * 0.2,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  logoTextContainer: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  logoText: {
    fontSize: 56,
    fontWeight: '900',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 8,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  logoUnderline: {
    width: 80,
    height: 4,
    backgroundColor: '#4DB6AC',
    borderRadius: 2,
    marginTop: 8,
  },
  decorativeContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'center',
  },
  decorativeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(26, 26, 26, 0.4)',
    marginHorizontal: 4,
  },
  dot1: {
    backgroundColor: '#4DB6AC',
  },
  dot2: {
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
  },
  dot3: {
    backgroundColor: 'rgba(26, 26, 26, 0.2)',
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  tagline: {
    fontSize: 20,
    color: '#1A1A1A',
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
    opacity: 0.8,
  },
  taglineAccent: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(26, 26, 26, 0.2)',
    borderRadius: 1,
    marginTop: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 120,
    width: '100%',
  },
  loadingBar: {
    width: 200,
    height: 3,
    backgroundColor: 'rgba(26, 26, 26, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loadingProgress: {
    width: '30%',
    height: '100%',
    backgroundColor: '#4DB6AC',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 14,
    color: '#767676',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  wave1: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: width,
    borderTopRightRadius: width,
  },
  wave2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopLeftRadius: width * 0.8,
    borderTopRightRadius: width * 0.8,
  },
});

export default SplashScreen;