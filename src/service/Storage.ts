import AsyncStorage from '@react-native-async-storage/async-storage';

// Save user profile data to AsyncStorage
export const saveUserProfile = async (userId: any, token: any, user: any = null) => {
  try {
    const userProfile = {
      userId,
      token,
      user, // Save the complete user object
      timestamp: new Date().toISOString(), // Optional: add timestamp
    };
    
    await AsyncStorage.setItem('userProfile', JSON.stringify(userProfile));
    console.log('User profile saved successfully:', userProfile);
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Retrieve user profile data from AsyncStorage
export const getUserProfile = async () => {
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

// Remove user profile data from AsyncStorage (e.g., during logout)
export const clearUserProfile = async () => {
  try {
    await AsyncStorage.removeItem('userProfile');
    console.log('User profile cleared from AsyncStorage');
  } catch (error) {
    console.error('Error clearing user profile:', error);
    throw error;
  }
};

// Check if user is logged in
export const isUserLoggedIn = async () => {
  try {
    const userProfile = await getUserProfile();
    return userProfile && userProfile.token ? true : false;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};