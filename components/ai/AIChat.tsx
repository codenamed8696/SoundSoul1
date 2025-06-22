import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useData } from '../../context/DataContext';
import { Send } from 'lucide-react-native';
import { Message } from '../../types'; // Assuming Message type is in your types file

export const AIChat = () => {
  const { sendAIMessage } = useData();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your SoundSoul AI companion. How are you feeling today? Remember, I'm here to support you, but I'm not a replacement for a therapist."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (input.trim().length === 0 || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const stream = await sendAIMessage(newMessages);
    if (!stream) {
      setLoading(false);
      setMessages(messages);
      return;
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let assistantResponse = '';

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    const processStream = async () => {
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                setLoading(false);
                break;
            }

            try {
                const chunk = decoder.decode(value, { stream: false });
                assistantResponse += chunk;
                setMessages(prev => {
                    const updatedMessages = [...prev];
                    updatedMessages[updatedMessages.length - 1].content = assistantResponse;
                    return updatedMessages;
                });
            } catch (error) {
                console.error("Error decoding stream chunk:", error);
            }
        }
    };
    processStream();
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={item.role === 'user' ? styles.userText : styles.aiText}>
        {item.content}
      </Text>
    </View>
  );

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={100}
    >
        <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={styles.listContent}
        />
        {loading && <ActivityIndicator style={styles.loadingIndicator} color="#4F46E5" />}
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="How can I help you today?"
                placeholderTextColor="#9CA3AF"
                multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={loading}>
                <Send color="#fff" size={20} />
            </TouchableOpacity>
        </View>
    </KeyboardAvoidingView>
  );
};

// Your original styles from AIChat.tsx
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    listContent: { padding: 10, paddingBottom: 20 },
    messageBubble: { borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginVertical: 5, maxWidth: '80%' },
    userBubble: { backgroundColor: '#4F46E5', alignSelf: 'flex-end' },
    aiBubble: { backgroundColor: '#FFFFFF', alignSelf: 'flex-start', borderWidth: 1, borderColor: '#E5E7EB' },
    userText: { color: '#FFFFFF', fontSize: 16 },
    aiText: { color: '#1F2937', fontSize: 16 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
    input: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, fontSize: 16 },
    sendButton: { backgroundColor: '#4F46E5', borderRadius: 25, padding: 12, width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
    loadingIndicator: { marginVertical: 10, alignSelf: 'flex-start', marginLeft: 10 }
});