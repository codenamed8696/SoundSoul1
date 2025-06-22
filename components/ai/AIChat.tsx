import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useData } from '@/context/DataContext';
import CrisisModal from '@/components/common/CrisisModal';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'end my life', 'self-harm', 'want to die'];

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! How can I help you today?' },
  ]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [crisisModalVisible, setCrisisModalVisible] = useState(false);

  const { sendAIMessage } = useData();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const checkForCrisisKeywords = (text: string) => {
    if (CRISIS_KEYWORDS.some(keyword => text.toLowerCase().includes(keyword))) {
      setCrisisModalVisible(true);
    }
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (trimmedInput.length === 0 || isLoading) return;

    const userMessage: Message = { role: 'user', content: trimmedInput };
    const messageHistoryForAPI = [...messages, userMessage];
    
    setMessages(messageHistoryForAPI);
    setInput('');
    setIsLoading(true);
    checkForCrisisKeywords(trimmedInput);

    try {
      // **THE CRITICAL CHANGE**: We now receive a simple 'reply' string.
      const { conversationId: newConversationId, reply } = await sendAIMessage(
        conversationId,
        messageHistoryForAPI
      );
      
      if (!conversationId) setConversationId(newConversationId);

      if (reply) {
        const assistantMessage: Message = { role: 'assistant', content: reply };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
          throw new Error("Received an empty reply from the server.");
      }

    } catch (error) {
      console.error('Error in handleSend:', error);
      const errorMessage: Message = { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <CrisisModal visible={crisisModalVisible} onClose={() => setCrisisModalVisible(false)} />
        
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={item.role === 'user' ? styles.userMessageText : styles.assistantMessageText}>{item.content}</Text>
            </View>
          )}
          contentContainerStyle={styles.messageListContent}
          style={styles.messageList}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type your message..."
            editable={!isLoading}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, (isLoading || input.trim().length === 0) && styles.disabledButton]} 
            onPress={handleSend} 
            disabled={isLoading || input.trim().length === 0}
          >
            {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.sendButtonText}>Send</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1 },
  messageList: { flex: 1, paddingHorizontal: 12, backgroundColor: '#f5f5f5' },
  messageListContent: { paddingTop: 10, paddingBottom: 10 },
  messageBubble: { borderRadius: 18, paddingVertical: 10, paddingHorizontal: 14, marginVertical: 4, maxWidth: '80%' },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  assistantBubble: { backgroundColor: '#E5E5EA', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userMessageText: { fontSize: 16, color: '#fff' },
  assistantMessageText: { fontSize: 16, color: '#000' },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#D1D1D6', backgroundColor: '#f5f5f5', alignItems: 'center' },
  input: { flex: 1, borderColor: '#D1D1D6', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, paddingTop: Platform.OS === 'ios' ? 10 : 8, paddingBottom: Platform.OS === 'ios' ? 10 : 8, marginRight: 10, backgroundColor: '#fff', fontSize: 16, maxHeight: 120 },
  sendButton: { backgroundColor: '#007AFF', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, justifyContent: 'center', alignItems: 'center', minWidth: 60 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabledButton: { backgroundColor: '#A9A9A9' }
});

export default AIChat;