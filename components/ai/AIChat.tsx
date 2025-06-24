//
// NAME: components/ai/AIChat.tsx
//
import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useData } from '@/context/DataContext';
import CrisisModal from '@/components/common/CrisisModal'; 

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CRISIS_KEYWORDS = ['suicide', 'kill myself', 'self-harm', 'want to die'];

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([{ role: 'assistant', content: "Hello! I'm your SoundSoul well-being companion. How are you feeling today?" }]);
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
    const conversationHistory: Message[] = [...messages, { role: 'user' as const, content: trimmedInput }];
    setMessages(conversationHistory);
    setInput('');
    setIsLoading(true);
    checkForCrisisKeywords(trimmedInput);
    
    try {
      const response = await sendAIMessage(conversationHistory);
      setMessages(prev => [...prev, { role: 'assistant' as const, content: response.reply }]);
    } catch (error) {
      console.error('Error in handleSend:', error);
      setMessages(prev => [...prev, { role: 'assistant' as const, content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={88}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={item.role === 'user' ? styles.userMessageText : styles.assistantMessageText}>{item.content}</Text>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          style={styles.messageList}
        />
        <View style={styles.inputContainer}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type your message..." />
          <TouchableOpacity onPress={handleSend} disabled={isLoading}>
            {isLoading ? <ActivityIndicator /> : <Text style={styles.sendButton}>Send</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <CrisisModal visible={crisisModalVisible} onClose={() => setCrisisModalVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  messageList: { paddingHorizontal: 10 },
  messageBubble: { borderRadius: 18, padding: 10, marginVertical: 5, maxWidth: '80%' },
  userBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end' },
  assistantBubble: { backgroundColor: '#E5E5EA', alignSelf: 'flex-start' },
  userMessageText: { color: 'white' },
  assistantMessageText: { color: 'black' },
  inputContainer: { flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#ccc' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10 },
  sendButton: { color: '#007AFF', marginLeft: 10, alignSelf: 'center', fontWeight: 'bold' }
});

export default AIChat;