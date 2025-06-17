import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import CustomHeader from '../components/CustomHeader';
import CustomBottomTab from '../components/CustomBottomTab';
import UserFeed from '../components/UserFeed';

const Dashboard = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <CustomHeader />
      
      {/* Scrollable Content*/}
      <View style={styles.content}>
        
        <UserFeed />
      </View> 
      
      {/* Fixed Bottom Tab */}
      <CustomBottomTab />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensures the container takes the full screen height
  },
  content: {
    flex: 1, // Allows the content to take remaining space above the Bottom Tab
    marginBottom: 70, // Add space for the Bottom Tab to prevent overlap
  },
});

export default Dashboard;
