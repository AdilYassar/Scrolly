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
  Dimensions 
} from 'react-native';

const { width } = Dimensions.get('window');

// Memoized OptimizedPostImage component with base64 support
const OptimizedPostImage = memo(({ imageUri, postId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);

  // Function to check if image is base64
  const isBase64Image = useCallback((uri) => {
    return uri && uri.startsWith('data:image/');
  }, []);

  // Function to get optimized image dimensions
  const getOptimizedDimensions = useCallback((originalWidth, originalHeight) => {
    const maxWidth = width - 40; // Account for padding
    const maxHeight = 300; // Maximum height for feed images
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    
    // Scale down if too wide
    if (newWidth > maxWidth) {
      newHeight = (newHeight * maxWidth) / newWidth;
      newWidth = maxWidth;
    }
    
    // Scale down if too tall
    if (newHeight > maxHeight) {
      newWidth = (newWidth * maxHeight) / newHeight;
      newHeight = maxHeight;
    }
    
    return { width: newWidth, height: newHeight };
  }, []);

  const handleImageLoad = useCallback((event) => {
    // For base64 images, we'll use default dimensions since we can't get actual dimensions easily
    if (isBase64Image(imageUri)) {
      const optimizedDims = getOptimizedDimensions(width - 40, 200);
      setImageDimensions(optimizedDims);
    } else {
      const { width: imgWidth, height: imgHeight } = event.nativeEvent.source;
      const optimizedDims = getOptimizedDimensions(imgWidth, imgHeight);
      setImageDimensions(optimizedDims);
    }
    setLoading(false);
  }, [getOptimizedDimensions, isBase64Image, imageUri]);

  const handleImageError = useCallback((error) => {
    console.log('Image load error for post:', postId, error);
    console.log('Image URI type:', isBase64Image(imageUri) ? 'base64' : 'url');
    console.log('Image URI length:', imageUri?.length);
    setError(true);
    setLoading(false);
  }, [postId, imageUri, isBase64Image]);

  // Get the proper source for the image
  const imageSource = useMemo(() => {
    if (isBase64Image(imageUri)) {
      return { uri: imageUri };
    } else {
      return { uri: imageUri };
    }
  }, [imageUri, isBase64Image]);

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load image</Text>
        <Text style={styles.errorSubText}>
          Type: {isBase64Image(imageUri) ? 'Base64' : 'URL'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.imageContainer}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#007bff" />
        </View>
      )}
      <Image
        source={imageSource}
        style={[
          styles.image,
          imageDimensions && {
            width: imageDimensions.width,
            height: imageDimensions.height,
          },
        ]}
        onLoad={handleImageLoad}
        onError={handleImageError}
        resizeMode="cover"
        fadeDuration={200}
        // Note: These props might not work with base64 images
        progressiveRenderingEnabled={!isBase64Image(imageUri)}
        cache={isBase64Image(imageUri) ? "default" : "force-cache"}
      />
    </View>
  );
});

// Memoized Post Item component
const PostItem = memo(({ item, onLike, onComment, onShare }) => {
  const authorName = useMemo(() => {
    return item.author?.name || item.author?.username || 'Unknown User';
  }, [item.author]);

  const formattedDate = useMemo(() => {
    return item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '';
  }, [item.createdAt]);

  const likesCount = useMemo(() => {
    return item.likes?.length || 0;
  }, [item.likes]);

  const commentsCount = useMemo(() => {
    return item.comments?.length || 0;
  }, [item.comments]);

  const handleLike = useCallback(() => {
    onLike(item._id);
  }, [item._id, onLike]);

  const handleComment = useCallback(() => {
    onComment(item._id);
  }, [item._id, onComment]);

  const handleShare = useCallback(() => {
    onShare(item._id);
  }, [item._id, onShare]);

  return (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image
          source={{
            uri: item.author?.profilePic || 'https://via.placeholder.com/150',
          }}
          style={styles.profilePic}
          defaultSource={{ uri: 'https://via.placeholder.com/150' }}
        />
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{authorName}</Text>
          {formattedDate && (
            <Text style={styles.timestamp}>{formattedDate}</Text>
          )}
        </View>
      </View>

      {/* Post Text */}
      {item.text && <Text style={styles.postText}>{item.text}</Text>}

      {/* Optimized Post Image with Base64 support */}
      {item.image && (
        <OptimizedPostImage imageUri={item.image} postId={item._id} />
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>
            👍 Like ({likesCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleComment}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>
            💬 Comment ({commentsCount})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Text style={styles.actionText}>
            📤 Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Main UserFeed component
const UserFeed = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  console.log('🏗️ UserFeed component render');
  console.log('📊 Current state - feed length:', feed.length);
  console.log('📊 Current state - loading:', loading);
  console.log('📊 Current state - error:', error);
  console.log('📊 Current state - refreshing:', refreshing);

  const fetchFeed = useCallback(async () => {
    console.log('🚀 Starting API call to fetch feed...');
    
    try {
      setError(null);
      console.log('📡 Making fetch request to API...');
      
      const response = await fetch(
        'https://001d-2400-adc5-124-2500-ddec-56ec-287f-f5e3.ngrok-free.app/api/posts/feed',
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
      console.log('📦 Raw API response received');
      console.log('📦 Response type:', typeof data);
      console.log('📦 Is array?', Array.isArray(data));
      
      if (data.posts) {
        console.log('📦 data.posts exists, type:', typeof data.posts);
        console.log('📦 data.posts is array?', Array.isArray(data.posts));
        console.log('📦 data.posts length:', data.posts?.length);
        
        // Log first post to check structure
        if (data.posts.length > 0) {
          const firstPost = data.posts[0];
          console.log('📋 First post ID:', firstPost._id);
          console.log('📋 First post text:', firstPost.text);
          console.log('📋 First post has image:', !!firstPost.image);
          console.log('📋 First post image type:', firstPost.image ? (firstPost.image.startsWith('data:image/') ? 'base64' : 'url') : 'none');
        }
      }
      
      // Handle different response structures
      if (data.posts && Array.isArray(data.posts)) {
        console.log('✅ Using data.posts array with', data.posts.length, 'items');
        setFeed(data.posts);
      } else if (Array.isArray(data)) {
        console.log('✅ Using direct data array with', data.length, 'items');
        setFeed(data);
      } else {
        console.log('❌ Unexpected response format');
        console.log('❌ Data keys:', Object.keys(data));
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('💥 Error fetching feed:', error);
      console.error('💥 Error message:', error.message);
      console.error('💥 Error stack:', error.stack);
      setError(error.message);
      Alert.alert('Error', 'Failed to load feed. Please try again.');
    } finally {
      console.log('🏁 fetchFeed finally block executed');
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 useEffect triggered - calling fetchFeed');
    fetchFeed();
  }, [fetchFeed]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFeed();
  }, [fetchFeed]);

  const handleLike = useCallback((postId) => {
    console.log('Like post:', postId);
    // Optimistic update
    setFeed(prevFeed => 
      prevFeed.map(post => 
        post._id === postId 
          ? { ...post, likes: [...(post.likes || []), 'current_user'] }
          : post
      )
    );
  }, []);

  const handleComment = useCallback((postId) => {
    console.log('Comment on post:', postId);
    // Navigate to comment screen or show comment modal
  }, []);

  const handleShare = useCallback((postId) => {
    console.log('Share post:', postId);
    // Implement native sharing
  }, []);

  const renderItem = useCallback(({ item, index }) => {
    console.log(`🎨 Rendering item ${index}:`, item._id);
    return (
      <PostItem 
        item={item} 
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
      />
    );
  }, [handleLike, handleComment, handleShare]);

  const keyExtractor = useCallback((item) => item._id, []);

  const getItemLayout = useCallback((data, index) => ({
    length: 350, // Approximate height of each post
    offset: 350 * index,
    index,
  }), []);

  const ListEmptyComponent = useMemo(() => {
    console.log('📭 Rendering empty component');
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No posts to show</Text>
        <Text style={styles.emptyText}>Feed length: {feed.length}</Text>
        <Text style={styles.emptyText}>Loading: {loading.toString()}</Text>
        <Text style={styles.emptyText}>Error: {error || 'none'}</Text>
      </View>
    );
  }, [feed.length, loading, error]);

  const refreshControl = useMemo(() => (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  ), [refreshing, onRefresh]);

  if (loading) {
    console.log('⏳ Showing loading screen');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading your feed...</Text>
      </View>
    );
  }

  if (error && feed.length === 0) {
    console.log('❌ Showing error screen');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load feed</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchFeed}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  console.log('📋 Rendering FlatList with', feed.length, 'items');

  return (
    <FlatList
      data={feed}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.feedContainer}
      refreshControl={refreshControl}
      ListEmptyComponent={ListEmptyComponent}
      showsVerticalScrollIndicator={false}
      // Performance optimizations
      removeClippedSubviews={true}
      maxToRenderPerBatch={5}
      windowSize={10}
      initialNumToRender={3}
      getItemLayout={getItemLayout}
      // Additional performance optimizations
      updateCellsBatchingPeriod={100}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      // Improve scroll performance
      scrollEventThrottle={16}
      onEndReachedThreshold={0.5}
      // Memory optimization
      legacyImplementation={false}
    />
  );
};

const styles = StyleSheet.create({
  feedContainer: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  postContainer: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePic: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
    backgroundColor: '#e0e0e0',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 12,
    color: '#333',
  },
  // OptimizedPostImage styles
  imageContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    minHeight: 200,
    borderRadius: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorSubText: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
  },
  actionText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default UserFeed;