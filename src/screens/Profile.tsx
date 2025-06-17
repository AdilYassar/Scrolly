import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  ScrollView,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const ITEM_SIZE = (width - 60) / 3; // 3 columns with padding

// Your server base URL - update this to match your actual server URL
const SERVER_BASE_URL = 'https://001d-2400-adc5-124-2500-ddec-56ec-287f-f5e3.ngrok-free.app';

// Default profile image (you can replace this with your own asset)
const DEFAULT_PROFILE_IMAGE = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get user profile from AsyncStorage
  const getUserProfileFromStorage = async () => {
    try {
      const userProfile = await AsyncStorage.getItem('userProfile');
      if (userProfile) {
        const parsedProfile = JSON.parse(userProfile);
        return parsedProfile;
      }
      return null;
    } catch (error) {
      console.error('Error retrieving user profile:', error);
      return null;
    }
  };

  // Process profile image - handle both base64 and file paths
  const processProfileImage = (profilePic) => {
    if (!profilePic) return null;
    
    // If it's already a complete data URI (base64), return as is
    if (profilePic.startsWith('data:image/')) {
      return profilePic;
    }
    
    // If it's a file path from server, construct the full URL
    if (typeof profilePic === 'string' && profilePic.includes('uploads/')) {
      // Remove leading slash if present
      const cleanPath = profilePic.startsWith('/') ? profilePic.substring(1) : profilePic;
      return `${SERVER_BASE_URL}/${cleanPath}`;
    }
    
    // If it's just a base64 string without data URI prefix
    if (typeof profilePic === 'string' && !profilePic.startsWith('http')) {
      return `data:image/jpeg;base64,${profilePic}`;
    }
    
    return null;
  };

  // Process post image - similar logic for post images
  const processPostImage = (postImage) => {
    if (!postImage) return null;
    
    // If it's already a complete data URI (base64), return as is
    if (postImage.startsWith('data:image/')) {
      return postImage;
    }
    
    // If it's a file path from server, construct the full URL
    if (typeof postImage === 'string' && postImage.includes('uploads/')) {
      // Remove leading slash if present
      const cleanPath = postImage.startsWith('/') ? postImage.substring(1) : postImage;
      return `${SERVER_BASE_URL}/${cleanPath}`;
    }
    
    // If it's just a base64 string without data URI prefix
    if (typeof postImage === 'string' && !postImage.startsWith('http')) {
      return `data:image/jpeg;base64,${postImage}`;
    }
    
    return postImage; // Return as is if it's already a valid URL
  };

  // Fetch user profile and posts from API
  const fetchUserProfile = async () => {
    try {
      const storedProfile = await getUserProfileFromStorage();
      
      if (!storedProfile || !storedProfile.userId) {
        Alert.alert('Error', 'No user profile found. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${SERVER_BASE_URL}/api/profile/${storedProfile.userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true', // Add this header for ngrok
            // Add authorization header if needed
            // 'Authorization': `Bearer ${storedProfile.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Profile data received:', data); // Debug log
      
      setUserProfile(data.user);
      setPosts(data.posts || []);
      
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserProfile();
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const renderPostItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.postItem, { marginLeft: index % 3 === 0 ? 0 : 5, marginRight: index % 3 === 2 ? 0 : 5 }]} 
      onPress={() => handlePostPress(item)}
      activeOpacity={0.8}
    >
      {item.image ? (
        <Image 
          source={{ uri: processPostImage(item.image) }} 
          style={styles.postImage}
          resizeMode="cover"
          onError={(error) => {
            console.log('Error loading post image:', error);
          }}
        />
      ) : (
        <View style={styles.postPlaceholder}>
          <Text style={styles.postPlaceholderText}>📷</Text>
        </View>
      )}
      {item.title && (
        <View style={styles.postTitleContainer}>
          <Text style={styles.postTitle} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const handlePostPress = (post) => {
    // Handle post press - navigate to post detail or show modal
    console.log('Post pressed:', post);
  };

  const renderProfileImage = () => {
    const processedImage = processProfileImage(userProfile?.profilePic);
    
    console.log('Original profilePic:', userProfile?.profilePic); // Debug log
    console.log('Processed profilePic:', processedImage); // Debug log
    
    if (processedImage) {
      return (
        <Image 
          source={{ uri: processedImage }} 
          style={styles.profileImage}
          onError={(error) => {
            console.log('Error loading profile image:', error);
            console.log('Attempted to load:', processedImage);
          }}
          onLoad={() => {
            console.log('Profile image loaded successfully');
          }}
        />
      );
    } else {
      return (
        <Image 
          source={{ uri: DEFAULT_PROFILE_IMAGE }} 
          style={styles.profileImage}
        />
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  if (!userProfile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchUserProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header with Gradient Background */}
        <View style={styles.profileHeaderContainer}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              {renderProfileImage()}
              <View style={styles.profileImageBorder} />
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {userProfile.name || 'Unknown User'}
              </Text>
              <Text style={styles.profileEmail}>
                {userProfile.email || 'No email'}
              </Text>
              {userProfile.bio && (
                <Text style={styles.profileBio} numberOfLines={2}>
                  {userProfile.bio}
                </Text>
              )}
            </View>
          </View>

          {/* Enhanced Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.followers || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userProfile.following || 0}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Posts</Text>
            <View style={styles.sectionTitleUnderline} />
          </View>
          
          {posts.length > 0 ? (
            <FlatList
              data={posts}
              renderItem={renderPostItem}
              numColumns={3}
              keyExtractor={(item, index) => item._id || item.id || `post-${index}`}
              scrollEnabled={false}
              contentContainerStyle={styles.postsGrid}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsEmoji}>📸</Text>
              <Text style={styles.noPostsTitle}>No posts yet</Text>
              <Text style={styles.noPostsSubtitle}>Share your first moment!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeaderContainer: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 15,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 25,
    paddingTop: 35,
  },
  profileImageContainer: {
    marginRight: 20,
    position: 'relative',
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  profileImageBorder: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: '#007AFF',
    opacity: 0.3,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  profileBio: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 25,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#e0e0e0',
    alignSelf: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  postsSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 5,
  },
  sectionTitleUnderline: {
    width: 30,
    height: 3,
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  postsGrid: {
    paddingBottom: 20,
  },
  postItem: {
    width: ITEM_SIZE,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  postImage: {
    width: '100%',
    height: ITEM_SIZE,
  },
  postPlaceholder: {
    width: '100%',
    height: ITEM_SIZE,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postPlaceholderText: {
    fontSize: 24,
  },
  postTitleContainer: {
    padding: 8,
  },
  postTitle: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
    fontWeight: '500',
  },
  noPostsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  noPostsEmoji: {
    fontSize: 48,
    marginBottom: 15,
  },
  noPostsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  noPostsSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default Profile;