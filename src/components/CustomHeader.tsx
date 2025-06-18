import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient'; // You'll need to install this package

const CustomHeader = ({ user }) => {
  const navigation = useNavigation();

  const navigateToProfile = () => {
    navigation.navigate('Profile'); // Ensure 'Profile' is the correct route name
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.notificationContainer}>
            <View style={styles.notificationIcon}>
              <Icon name="person" size={16} color="#fff" />
            </View>
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addStoryButton}>
            <Icon name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.profileContainer} onPress={navigateToProfile}>
          <Image
            source={{
              uri: user?.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
      
      {/* Gradient overlay at the bottom */}
      <LinearGradient
        colors={['#A8F5E8', '#A8F5E880', '#A8F5E800']} // Gradient from your header color to transparent
        style={styles.gradientOverlay}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15, // Increased padding
    backgroundColor: '#A8F5E8',
    height: 120, // Made the header larger
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: -20, // Extends below the header
    left: 0,
    right: 0,
    height: 30, // Height of the gradient effect
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addStoryButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
});

export default CustomHeader;