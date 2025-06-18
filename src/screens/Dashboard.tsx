import React from 'react';
import {
   View,
   StyleSheet,
   StatusBar,
   SafeAreaView,
   Platform,
   ScrollView
} from 'react-native';
import CustomHeader from '../components/CustomHeader';
import CustomBottomTab from '../components/CustomBottomTab';
import UserFeed from '../components/UserFeed';
import StoryComponent from '../components/StoryComponent';

const Dashboard = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Status Bar Configuration */}
      <StatusBar 
         barStyle="dark-content"
         backgroundColor="#fff"
         translucent={false}
      />
             
      <View style={styles.container}>
        {/* Fixed Header with Shadow */}
        <View style={styles.headerContainer}>
          <CustomHeader />
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Stories Section */}
          <View style={styles.storiesContainer}>
            <StoryComponent />
          </View>
                   
          {/* Main Content Area */}
          <View style={styles.content}>
            <UserFeed />
          </View>
        </ScrollView>
                 
        {/* Fixed Bottom Tab with Shadow */}
        <View style={styles.bottomTabContainer}>
          <CustomBottomTab />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Light background for better contrast
  },
  headerContainer: {
    backgroundColor: '#fff',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    // Shadow for Android
    elevation: 5,
    // Ensure header stays on top
    zIndex: 1000,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 95 : 85, // Extra padding to account for bottom tab
  },
  storiesContainer: {
    backgroundColor: '#fff',
    // Add subtle shadow below stories
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 5,
  },
  content: {
    backgroundColor: '#f8f9fa',
    minHeight: 500, // Minimum height to ensure scrollability
    paddingHorizontal: 0,
  },
  bottomTabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    // Strong shadow for bottom tab
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 10,
    // Ensure bottom tab stays on top
    zIndex: 1001,
    borderTopWidth: 1,
    borderTopColor: '#e1e8ed',
    // Add padding for different devices
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    minHeight: Platform.OS === 'ios' ? 85 : 65,
  },
});

export default Dashboard;