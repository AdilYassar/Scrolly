import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet, 
  Alert, 
  RefreshControl,
  Dimensions,
  Modal
} from 'react-native';
import { BASE_URL } from '../utils/config';
import Colors from '../utils/Constants';

const { width } = Dimensions.get('window');

// Memoized Story Circle component (now rounded rectangle)
const StoryCircle = memo(({ item, onPress, index }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Function to check if image is base64
  const isBase64Image = useCallback((uri) => {
    return uri && uri.startsWith('data:image/');
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback((error) => {
    console.log('Story image load error:', error);
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const authorName = useMemo(() => {
    return item.author?.name || item.author?.username || 'Unknown User';
  }, [item.author]);

  // Get the proper source for the image
  const imageSource = useMemo(() => {
    if (item.image) {
      return { uri: item.image };
    }
    return { uri: item.author?.profilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face' };
  }, [item.image, item.author?.profilePic]);

  const handlePress = useCallback(() => {
    onPress(item, index);
  }, [item, index, onPress]);

  return (
    <TouchableOpacity style={styles.storyContainer} onPress={handlePress}>
      <View style={styles.storyImageContainer}>
        {!imageLoaded && (
          <View style={styles.storyLoadingContainer}>
            <ActivityIndicator size="small" color="#007bff" />
          </View>
        )}
        
        {imageError ? (
          <View style={styles.storyErrorContainer}>
            <Text style={styles.storyErrorText}>!</Text>
          </View>
        ) : (
          <Image
            source={imageSource}
            style={styles.storyImage}
            onLoad={handleImageLoad}
            onError={handleImageError}
            resizeMode="cover"
            fadeDuration={200}
            progressiveRenderingEnabled={!isBase64Image(item.image)}
            cache={isBase64Image(item.image) ? "default" : "force-cache"}
          />
        )}
        
        {/* Gradient Border for Story */}
        <View style={styles.storyBorder} />
        
        {/* Small profile picture in bottom right corner */}
        {/* <View style={styles.profilePicContainer}>
          <Image
            source={{
              uri: item.author?.profilePic || 'https://via.placeholder.com/150',
            }}
            style={styles.profilePic}
            resizeMode="cover"
          />
        </View> */}
      </View>
      
      <Text style={styles.storyUsername} numberOfLines={1}>
        {authorName.length > 10 ? `${authorName.substring(0, 10)}...` : authorName}
      </Text>
    </TouchableOpacity>
  );
});

// Story Viewer Modal Component
const StoryViewer = memo(({ visible, stories, currentIndex, onClose, onNext, onPrevious }) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(currentIndex || 0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  const currentStory = stories[currentStoryIndex];

  // Auto progress timer
  useEffect(() => {
    if (!visible || !imageLoaded) return;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < stories.length - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            setProgress(0);
            setImageLoaded(false);
          } else {
            // Close modal when all stories are done
            onClose();
          }
          return 0;
        }
        return prev + 2; // Progress by 2% every 100ms (5 seconds total)
      });
    }, 100);

    return () => clearInterval(timer);
  }, [visible, imageLoaded, currentStoryIndex, stories.length, onClose]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    setImageLoaded(false);
  }, [currentStoryIndex]);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
      setImageLoaded(false);
    } else {
      onClose();
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
      setImageLoaded(false);
    }
  }, [currentStoryIndex]);

  if (!currentStory) return null;

  const authorName = currentStory.author?.name || currentStory.author?.username || 'Unknown User';
  const formattedDate = currentStory.createdAt ? new Date(currentStory.createdAt).toLocaleDateString() : '';

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.storyViewerContainer}>
        {/* Progress bars */}
        <View style={styles.progressContainer}>
          {stories.map((_, index) => (
            <View key={index} style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar,
                  {
                    width: index === currentStoryIndex 
                      ? `${progress}%` 
                      : index < currentStoryIndex 
                        ? '100%' 
                        : '0%'
                  }
                ]} 
              />
            </View>
          ))}
        </View>

        {/* Story Header */}
        <View style={styles.storyHeader}>
          <View style={styles.storyAuthorInfo}>
            <Image
              source={{
                uri: currentStory.author?.profilePic || 'https://via.placeholder.com/150',
              }}
              style={styles.storyAuthorPic}
            />
            <View>
              <Text style={styles.storyAuthorName}>{authorName}</Text>
              <Text style={styles.storyTimestamp}>{formattedDate}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeStoryButton}>
            <Text style={styles.closeStoryText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Story Content */}
        <View style={styles.storyContent}>
          {!imageLoaded && (
            <View style={styles.storyContentLoading}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
          
          {currentStory.image && (
            <Image
              source={{ uri: currentStory.image }}
              style={styles.storyContentImage}
              onLoad={handleImageLoad}
              resizeMode="contain"
              fadeDuration={200}
            />
          )}

          {/* Story Text Overlay */}
          {currentStory.text && (
            <View style={styles.storyTextOverlay}>
              <Text style={styles.storyText}>{currentStory.text}</Text>
            </View>
          )}
        </View>

        {/* Touch Areas for Navigation */}
        <TouchableOpacity 
          style={styles.storyTouchLeft}
          onPress={handlePrevious}
          activeOpacity={1}
        />
        <TouchableOpacity 
          style={styles.storyTouchRight}
          onPress={handleNext}
          activeOpacity={1}
        />
      </View>
    </Modal>
  );
});

// Main Story Component
const StoryComponent = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);

  console.log('🏗️ StoryComponent render');
  console.log('📊 Current state - stories length:', stories.length);
  console.log('📊 Current state - loading:', loading);
  console.log('📊 Current state - error:', error);

  const fetchStories = useCallback(async () => {
    console.log('🚀 Starting API call to fetch stories...');
    
    try {
      setError(null);
      console.log('📡 Making fetch request to API...');
      
      const response = await fetch(
        `${BASE_URL}/api/posts/feed`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
        }
      );

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Raw API response received for stories');
      
      let feedData = [];
      
      // Handle different response structures
      if (data.posts && Array.isArray(data.posts)) {
        feedData = data.posts;
      } else if (Array.isArray(data)) {
        feedData = data;
      } else {
        throw new Error('Unexpected response format');
      }

      // Filter posts that have images to show as stories
      const storiesWithImages = feedData.filter(post => post.image);
      
      console.log('✅ Filtered stories with images:', storiesWithImages.length);
      setStories(storiesWithImages);
      
    } catch (error) {
      console.error('💥 Error fetching stories:', error);
      console.error('💥 Error message:', error.message);
      setError(error.message);
      Alert.alert('Error', 'Failed to load stories. Please try again.');
    } finally {
      console.log('🏁 fetchStories finally block executed');
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect triggered - calling fetchStories');
    fetchStories();
  }, [fetchStories]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStories();
  }, [fetchStories]);

  const handleStoryPress = useCallback((story, index) => {
    console.log('👆 Story pressed:', story._id, 'at index:', index);
    setSelectedStoryIndex(index);
    setStoryViewerVisible(true);
  }, []);

  const handleCloseStoryViewer = useCallback(() => {
    setStoryViewerVisible(false);
    setSelectedStoryIndex(0);
  }, []);

  const renderStoryItem = useCallback(({ item, index }) => {
    return (
      <StoryCircle 
        item={item} 
        onPress={handleStoryPress}
        index={index}
      />
    );
  }, [handleStoryPress]);

  const keyExtractor = useCallback((item) => item._id, []);

  const ListEmptyComponent = useMemo(() => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyStoriesContainer}>
        <Text style={styles.emptyStoriesText}>No stories available</Text>
      </View>
    );
  }, [loading]);

  const refreshControl = useMemo(() => (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  ), [refreshing, onRefresh]);

  if (loading) {
    return (
      <View style={styles.storiesLoadingContainer}>
        <ActivityIndicator size="small" color="#007bff" />
        <Text style={styles.storiesLoadingText}>Loading stories...</Text>
      </View>
    );
  }

  if (error && stories.length === 0) {
    return (
      <View style={styles.storiesErrorContainer}>
        <Text style={styles.storiesErrorText}>Failed to load stories</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchStories}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View style={styles.storiesContainer}>
        <FlatList
          data={stories}
          keyExtractor={keyExtractor}
          renderItem={renderStoryItem}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesList}
          refreshControl={refreshControl}
          ListEmptyComponent={ListEmptyComponent}
          // Performance optimizations
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={5}
          // Improve scroll performance
          scrollEventThrottle={16}
          getItemLayout={(data, index) => ({
            length: 90,
            offset: 90 * index,
            index,
          })}
        />
      </View>

      {/* Story Viewer Modal */}
      <StoryViewer
        visible={storyViewerVisible}
        stories={stories}
        currentIndex={selectedStoryIndex}
        onClose={handleCloseStoryViewer}
      />
    </>
  );
};

const styles = StyleSheet.create({
  storiesContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryGradientEnd,
  },
  storiesList: {
    paddingHorizontal: 10,
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 15,
    width: 80,
  },
  storyImageContainer: {
    width: 75,
    height: 100,
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storyBorder: {
    position: 'absolute',
    width: 75,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primaryGradientStart,
    top: 0,
    left: 0,
  },
  storyImage: {
    width: 71,
    height: 96,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  storyLoadingContainer: {
    width: 71,
    height: 96,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyErrorContainer: {
    width: 71,
    height: 96,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyErrorText: {
    color: '#666',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profilePicContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePic: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  storyUsername: {
    marginTop: 5,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  emptyStoriesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyStoriesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  storiesLoadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  storiesLoadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
  },
  storiesErrorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  storiesErrorText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Story Viewer Styles
  storyViewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 50,
    paddingBottom: 10,
    gap: 2,
  },
  progressBarContainer: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 1,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  storyAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyAuthorPic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#e0e0e0',
  },
  storyAuthorName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storyTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  closeStoryButton: {
    padding: 5,
  },
  closeStoryText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  storyContentLoading: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  storyContentImage: {
    width: '100%',
    height: '100%',
  },
  storyTextOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  storyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  storyTouchLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '30%',
  },
  storyTouchRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '70%',
  },
});

export default StoryComponent;