import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Text,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage utility functions
const getUserProfile = async () => {
  try {
    const userProfile = await AsyncStorage.getItem('userProfile');
    if (userProfile) {
      const parsedProfile = JSON.parse(userProfile);
      console.log('Retrieved user profile:', parsedProfile);
      return parsedProfile;
    }
    console.log('No user profile found in AsyncStorage');
    return null;
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    return null;
  }
};

const CustomBottomTab = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  const openImagePicker = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.5, // Reduced quality to decrease file size
      maxWidth: 800, // Limit image dimensions
      maxHeight: 800,
      includeBase64: true,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorMessage) {
        console.error('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const asset = response.assets[0];
        
        // Check file size (roughly estimate base64 size)
        const estimatedBase64Size = (asset.fileSize * 4) / 3; // Base64 is ~33% larger
        const maxSizeInMB = 2; // 2MB limit
        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
        
        if (estimatedBase64Size > maxSizeInBytes) {
          Alert.alert(
            'Image Too Large', 
            `Please select an image smaller than ${maxSizeInMB}MB. Current image is approximately ${(estimatedBase64Size / (1024 * 1024)).toFixed(1)}MB.`
          );
          return;
        }
        
        setSelectedImage(asset);
        
        // Convert to base64 data URL
        const imageDataUrl = `data:${asset.type};base64,${asset.base64}`;
        setImageUrl(imageDataUrl);
        
        console.log('Image selected:', {
          size: asset.fileSize,
          dimensions: `${asset.width}x${asset.height}`,
          estimatedBase64Size: `${(estimatedBase64Size / (1024 * 1024)).toFixed(2)}MB`
        });
      }
    });
  };

  const handleCreatePost = async () => {
    try {
      // Validate that we have either text or image
      if (!postText.trim() && !imageUrl) {
        Alert.alert('Error', 'Please add some text or select an image');
        return;
      }

      // Get user profile from AsyncStorage
      const userProfile = await getUserProfile();
      if (!userProfile || !userProfile.userId) {
        Alert.alert('Error', 'User not logged in. Please log in first.');
        return;
      }

      const authorId = userProfile.userId;
      console.log('Author ID retrieved from AsyncStorage:', authorId);

      // For very large images, consider using multipart/form-data instead of JSON
      let requestBody;
      let contentType;

      if (imageUrl && imageUrl.length > 1000000) { // If image is > 1MB in base64
        // Use FormData for large images
        const formData = new FormData();
        formData.append('text', postText.trim());
        formData.append('authorId', authorId.toString()); // Add author ID
        
        if (selectedImage) {
          formData.append('image', {
            uri: selectedImage.uri,
            type: selectedImage.type,
            name: selectedImage.fileName || 'image.jpg',
          });
        }
        
        requestBody = formData;
        contentType = 'multipart/form-data';
      } else {
        // Use JSON for smaller payloads
        requestBody = JSON.stringify({
          text: postText.trim(),
          imageUrl: imageUrl || '',
          authorId: authorId // Add author ID
        });
        contentType = 'application/json';
      }

      console.log('Sending post data...');
      console.log('Post text:', postText);
      console.log('Author ID:', authorId);
      console.log('Has image:', !!imageUrl);
      console.log('Content type:', contentType);
      console.log('Payload size estimate:', 
        typeof requestBody === 'string' 
          ? `${(requestBody.length / 1024).toFixed(2)}KB` 
          : 'FormData (multipart)'
      );

      const headers = {
        'ngrok-skip-browser-warning': 'true',
      };

      // Add authorization header if token exists
      if (userProfile.token) {
        headers['Authorization'] = `Bearer ${userProfile.token}`;
      }

      // Only set Content-Type for JSON, let FormData set its own boundary
      if (contentType === 'application/json') {
        headers['Content-Type'] = contentType;
      }

      const response = await fetch(
        'https://4a60-2400-adc5-124-2500-ddec-56ec-287f-f5e3.ngrok-free.app/api/posts/create',
        {
          method: 'POST',
          headers,
          body: requestBody,
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = 'Unknown error occurred';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`;
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        
        console.error('Server error:', errorMessage);
        Alert.alert('Error', `Failed to create post: ${errorMessage}`);
        return;
      }

      const responseData = await response.json();
      console.log('Post created successfully:', responseData);
      
      Alert.alert('Success', 'Post created successfully!');
      
      // Reset form
      setModalVisible(false);
      setPostText('');
      setSelectedImage(null);
      setImageUrl('');
      
    } catch (error) {
      console.error('Network or other error:', error);
      Alert.alert('Error', `Network error: ${error.message}`);
    }
  };

  return (
    <View style={styles.bottomTab}>
      {/* Modal for Creating Post */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Post</Text>
            
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              value={postText}
              onChangeText={setPostText}
              multiline
              numberOfLines={4}
            />
            
            <TouchableOpacity onPress={openImagePicker} style={styles.imagePicker}>
              <Icon name="camera-outline" size={20} color="#00D4AA" />
              <Text style={styles.imagePickerText}>
                {selectedImage ? 'Change Image' : 'Add Image (Max 2MB)'}
              </Text>
            </TouchableOpacity>
            
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                <Text style={styles.imageSizeText}>
                  {(selectedImage.fileSize / (1024 * 1024)).toFixed(2)}MB
                </Text>
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => {
                    setSelectedImage(null);
                    setImageUrl('');
                  }}
                >
                  <Icon name="close-circle" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.postButton]} 
                onPress={handleCreatePost}
                disabled={!postText.trim() && !imageUrl}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]} 
                onPress={() => {
                  setModalVisible(false);
                  setPostText('');
                  setSelectedImage(null);
                  setImageUrl('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Tab Items */}
      <TouchableOpacity style={styles.tabItem}>
        <Icon name="home" size={24} color="#00D4AA" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.tabItem}>
        <Icon name="search-outline" size={24} color="#9CA3AF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.tabItem}>
        <Icon name="camera-outline" size={24} color="#9CA3AF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.tabItem}>
        <Icon name="people-outline" size={24} color="#9CA3AF" />
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setModalVisible(true)}
      >
        <Icon name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomTab: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#00D4AA',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00D4AA',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
  },
  imagePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#00D4AA',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderStyle: 'dashed',
  },
  imagePickerText: {
    marginLeft: 8,
    color: '#00D4AA',
    fontSize: 16,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  imageSizeText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: 70,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: '#00D4AA',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default CustomBottomTab;