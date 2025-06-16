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
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { Send, MessageCircle, Lock } from 'lucide-react-native';
import { Button } from '@/components/common/Button';
import { router } from 'expo-router';
import { Card } from '@/components/common/Card';

// Define the structure of a single message object
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// --- NEW COMPONENT ---
// This is the prompt we show to anonymous users.
const AnonymousChatPrompt = () => {
  return (
    <View style={styles.promptContainer}>
      <Card style={styles.promptCard}>
        <View style={styles.promptIconContainer}>
          <MessageCircle size={32} color="#4f46e5" />
        </View>
        <Text style={styles.promptTitle}>Unlock Your AI Wellness Companion</Text>
        <Text style={styles.promptText}>
          Our AI is available 24/7 to help you with stress, anxiety, and wellness goals. 
          Create a free account to save your chat history and get personalized support.
        </Text>
        <Button 
            title="Create a Free Account" 
            onPress={() => router.push('/(auth)/signup')}
            style={{marginBottom: 16}} 
        />
        <Button 
            title="Add Employer Code" 
            onPress={() => router.push('/(tabs)/profile')}
            variant="ghost"
        />
      </Card>
    </View>
  );
};


// --- Main Chat Screen Component ---
const ChatScreen = () => {
  const { user } = useAuth();
  const { aiChats, sendAIMessage, loading } = useData();
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const isAnonymous = user?.is_anonymous;

  useEffect(() => {
    if (aiChats && aiChats.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [aiChats]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || loading.chat) {
      return;
    }
    const messageToSend = newMessage.trim();
    setNewMessage('');
    await sendAIMessage(messageToSend);
  };

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

  // --- CONDITIONAL RENDERING ---
  // If the user is anonymous, show the prompt. Otherwise, show the chat.
  if (isAnonymous) {
    return (
        <SafeAreaView style={styles.container}>
            <AnonymousChatPrompt />
        </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={aiChats}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          style={styles.messageList}
          contentContainerStyle={{ paddingBottom: 10 }}
        />

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
            disabled={loading.chat}
          >
            {loading.chat ? <ActivityIndicator size="small" color="#ffffff" /> : <Send size={20} color="#ffffff" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  // --- Prompt Styles ---
  promptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  promptCard: {
    width: '100%',
    alignItems: 'center',
  },
  promptIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  promptTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#4b5563',
    lineHeight: 24,
  },
  // --- Original Chat Styles ---
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