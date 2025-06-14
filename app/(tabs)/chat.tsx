import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  StyleSheet, 
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import { useData } from '@/context/DataContext';
import { Send } from 'lucide-react-native';

// This defines the structure of a single message object
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatScreen = () => {
  // THE FIX: Get the real chat history, send function, and loading state from DataContext
  const { aiChats, sendAIMessage, loading } = useData();

  // We still need local state for the text input field
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // This effect scrolls to the bottom when new messages are added to the global state
  useEffect(() => {
    if (aiChats && aiChats.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [aiChats]);

  // THE FIX: This function now calls the working sendAIMessage from our context
  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || loading.chat) {
      return;
    }
    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear input immediately
    await sendAIMessage(messageToSend);
  };

  // Your original renderItem function for the FlatList
  const renderMessage = ({ item }: { item: Message }) => {
    const isUserMessage = item.role === 'user';
    return (
      <View style={[
        styles.messageBubble,
        isUserMessage ? styles.userBubble : styles.assistantBubble
      ]}>
        <Text style={isUserMessage ? styles.userText : styles.assistantText}>
          {item.content}
        </Text>
      </View>
    );
  };

  // Your original UI structure is preserved
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        {/* THE FIX: The FlatList now gets its data from `aiChats` from the context */}
        <FlatList
          ref={flatListRef}
          data={aiChats}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          style={styles.messageList}
          contentContainerStyle={{ paddingBottom: 10 }}
        />

        {/* THE FIX: The typing indicator now uses `loading.chat` from the context */}
        {loading.chat && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>Assistant is typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor="#6b7280"
          />
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={handleSendMessage}
            disabled={loading.chat} // Disable button while loading
          >
            {loading.chat ? <ActivityIndicator size="small" color="#ffffff" /> : <Send size={20} color="#ffffff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Your original styles are fully preserved
const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  messageList: {
    paddingHorizontal: 16,
  },
  messageBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 10,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#6366f1',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: '#ffffff',
    fontSize: 16,
  },
  assistantText: {
    color: '#111827',
    fontSize: 16,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    alignItems: 'flex-start',
  },
  typingText: {
    fontStyle: 'italic',
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  sendButton: {
    marginLeft: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;