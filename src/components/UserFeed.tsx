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
  Modal,
  TextInput
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

// Comment Modal Component
const CommentModal = memo(({ visible, onClose, postId, currentUserId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitComment = useCallback(async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (!currentUserId) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    setSubmitting(true);
    
    try {
      console.log('💬 Submitting comment for post:', postId);
      console.log('💬 Comment text:', commentText);
      console.log('💬 User ID:', currentUserId);

      const response = await fetch(
        `https://4a60-2400-adc5-124-2500-ddec-56ec-287f-f5e3.ngrok-free.app/api/posts/comment/${postId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            text: commentText.trim(),
            userId: currentUserId
          }),
        }
      );

      console.log('📊 Comment response status:', response.status);
      console.log('📊 Comment response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Comment response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Comment API response:', result);

      // Clear the input and close modal
      setCommentText('');
      onClose();
      
      // Notify parent component about the new comment
      if (onCommentAdded) {
        onCommentAdded(postId, result.comment);
      }

      Alert.alert('Success', 'Comment added successfully!');
      
    } catch (error) {
      console.error('💥 Error adding comment:', error);
      console.error('💥 Error message:', error.message);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [commentText, currentUserId, postId, onClose, onCommentAdded]);

  const handleCancel = useCallback(() => {
    setCommentText('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Comment</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.commentInput}
            placeholder="Write your comment..."
            value={commentText}
            onChangeText={setCommentText}
            multiline={true}
            numberOfLines={4}
            maxLength={500}
            autoFocus={true}
            textAlignVertical="top"
          />
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={handleCancel}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.submitButton,
                (!commentText.trim() || submitting) && styles.submitButtonDisabled
              ]} 
              onPress={handleSubmitComment}
              disabled={!commentText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Post Comment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

// Memoized Post Item component
const PostItem = memo(({ item, onLike, onComment, onShare, currentUserId, likingPost }) => {
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

  // Check if current user has liked this post
  const isLikedByUser = useMemo(() => {
    return item.likes?.some(like => like.toString() === currentUserId?.toString()) || false;
  }, [item.likes, currentUserId]);

  const handleLike = useCallback(() => {
    onLike(item._id);
  }, [item._id, onLike]);

  const handleComment = useCallback(() => {
    onComment(item._id);
  }, [item._id, onComment]);

  const handleShare = useCallback(() => {
    onShare(item._id);
  }, [item._id, onShare]);

  const isCurrentPostLiking = likingPost === item._id;

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
          style={[
            styles.actionButton,
            isLikedByUser && styles.likedButton,
            isCurrentPostLiking && styles.likingButton
          ]}
          onPress={handleLike}
          disabled={isCurrentPostLiking}
          activeOpacity={0.7}
        >
          {isCurrentPostLiking ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <Text style={[
              styles.actionText,
              isLikedByUser && styles.likedText
            ]}>
              {isLikedByUser ? '❤️' : '👍'} Like ({likesCount})
            </Text>
          )}
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
  const [likingPost, setLikingPost] = useState(null); // Track which post is being liked
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  
  // For demo purposes, using a hardcoded user ID
  // In a real app, this would come from authentication context or async storage
  const [currentUserId] = useState('60d0fe4f5311236168a109ca'); // Replace with actual user ID

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
        'https://4a60-2400-adc5-124-2500-ddec-56ec-287f-f5e3.ngrok-free.app/api/posts/feed',
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

  const handleLike = useCallback(async (postId) => {
    console.log('🔥 Like post clicked:', postId);
    console.log('👤 Current user ID:', currentUserId);
    
    if (!currentUserId) {
      Alert.alert('Error', 'User ID not found. Please log in again.');
      return;
    }

    // Set loading state for this specific post
    setLikingPost(postId);
    
    try {
      console.log('📡 Making like API request...');
      console.log('📊 Requesting like for post ID:', postId);
      const response = await fetch(
        `https://4a60-2400-adc5-124-2500-ddec-56ec-287f-f5e3.ngrok-free.app/api/posts/like/${postId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            userId: currentUserId
          }),
        }
      );

      console.log('📊 Like response status:', response.status);
      console.log('📊 Like response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('❌ Like response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Like API response:', result);
      console.log('✅ Is liked:', result.isLiked);
      console.log('✅ Likes count:', result.likesCount);

      // Update the feed with the new like status
      setFeed(prevFeed => 
        prevFeed.map(post => {
          if (post._id === postId) {
            let updatedLikes;
            if (result.isLiked) {
              // Add current user to likes if not already present
              if (!post.likes.some(like => like.toString() === currentUserId.toString())) {
                updatedLikes = [...post.likes, currentUserId];
              } else {
                updatedLikes = post.likes;
              }
            } else {
              // Remove current user from likes
              updatedLikes = post.likes.filter(like => like.toString() !== currentUserId.toString());
            }
            
            return {
              ...post,
              likes: updatedLikes
            };
          }
          return post;
        })
      );

      console.log('✅ Feed updated successfully');
      
    } catch (error) {
      console.error('💥 Error liking post:', error);
      console.error('💥 Error message:', error.message);
      Alert.alert('Error', 'Failed to like post. Please try again.');
      
      // Optionally revert optimistic update here if you had one
    } finally {
      setLikingPost(null);
      console.log('🏁 Like operation completed');
    }
  }, [currentUserId]);

  const handleComment = useCallback((postId) => {
    console.log('💬 Comment on post:', postId);
    setSelectedPostId(postId);
    setCommentModalVisible(true);
  }, []);

  const handleCommentAdded = useCallback((postId, newComment) => {
    console.log('✅ Comment added successfully:', newComment);
    
    // Update the feed to increment comment count
    setFeed(prevFeed => 
      prevFeed.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [...(post.comments || []), newComment._id]
          };
        }
        return post;
      })
    );
  }, []);

  const handleCloseCommentModal = useCallback(() => {
    setCommentModalVisible(false);
    setSelectedPostId(null);
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
        currentUserId={currentUserId}
        likingPost={likingPost}
      />
    );
  }, [handleLike, handleComment, handleShare, currentUserId, likingPost]);

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
    <>
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
      
      {/* Comment Modal */}
      <CommentModal
        visible={commentModalVisible}
        onClose={handleCloseCommentModal}
        postId={selectedPostId}
        currentUserId={currentUserId}
        onCommentAdded={handleCommentAdded}
      />
    </>
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
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  likedButton: {
    backgroundColor: '#ffe6e6',
  },
  likingButton: {
    backgroundColor: '#f0f0f0',
  },
  actionText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  likedText: {
    color: '#e74c3c',
    fontWeight: 'bold',
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
  // Comment Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    marginTop: 15,
    marginBottom: 20,
    fontSize: 16,
    minHeight: 100,
    maxHeight: 150,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserFeed;