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
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/context/supabaseClient';
import { Send } from 'lucide-react-native';

// This defines the structure of a single message object
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ChatScreen = () => {
  const { user } = useAuth();
  // We get conversations and loading state from our DataContext
  const { conversations, loading: dataLoading } = useData();

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // This effect runs when the data from the context is loaded
  useEffect(() => {
    // We find the existing AI conversation or prepare to start a new one
    if (!dataLoading && conversations) {
      // For this example, we'll just use a mock set of messages.
      // In a real app, you would fetch these from your new `messages` table
      // based on the conversation ID.
      setMessages([
        { id: '1', role: 'assistant', content: 'Hello! I am your AI Wellness Companion. How are you feeling today?' }
      ]);
    }
  }, [dataLoading, conversations]);

  const handleSend = async () => {
    if (newMessage.trim() === '' || !user) return;

    const userMessage: Message = {
      id: Math.random().toString(), // Use a better ID in production
      role: 'user',
      content: newMessage.trim(),
    };

    // Add user's message to the screen immediately for a good UX
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // Call the Supabase Edge Function we created
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { query: userMessage.content },
      });

      if (error) {
        throw error;
      }

      // Add the AI's response to the screen
      const aiMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.response || "I'm sorry, I had trouble thinking of a response.",
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error calling AI chat function:", error);
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: 'I had an issue connecting. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // This is the CRITICAL fix for the crash. We show a loading spinner
  // while the initial data (like conversations) is being fetched.
  if (dataLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.role === 'user' ? styles.userBubble : styles.assistantBubble
            ]}>
              <Text style={item.role === 'user' ? styles.userText : styles.assistantText}>
                {item.content}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {isLoading && (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>AI is thinking...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={isLoading}>
            <Send size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    padding: 16,
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
  },
  typingText: {
    fontStyle: 'italic',
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  textInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#f3f4f6',
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatScreen;