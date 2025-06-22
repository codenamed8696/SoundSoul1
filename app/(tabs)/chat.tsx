import React from 'react';
import { StyleSheet, View } from 'react-native';
import AIChat from '@/components/ai/AIChat';

/**
 * This is the main screen for the AI Chat feature.
 * It now acts as a simple, full-screen container for the AIChat component.
 */
const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <AIChat />
    </View>
  );
};

const styles = StyleSheet.create({
  /**
   * This style is crucial. It ensures that the container takes up the entire
   * available screen space, allowing the AIChat component within it to expand correctly.
   */
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // A neutral background color
  },
});

export default ChatScreen;