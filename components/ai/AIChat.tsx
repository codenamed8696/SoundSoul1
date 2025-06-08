import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Alert
} from 'react-native';
import { Send, Bot, User, AlertTriangle } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { useData } from '@/context/DataContext';

export function AIChat() {
  const { aiChats, sendAIMessage } = useData();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  const currentChat = aiChats.find(chat => chat.id === 'ai-chat-main');
  const messages = currentChat?.messages || [];

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    
    const userMessage = message.trim();
    setMessage('');
    setLoading(true);
    
    try {
      await sendAIMessage(userMessage);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'crisis': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      default: return '#6b7280';
    }
  };

  const renderMessage = (msg: any, index: number) => {
    const isUser = msg.role === 'user';
    const showRiskIndicator = isUser && msg.riskLevel && msg.riskLevel !== 'low';
    
    return (
      <View key={index} style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.aiMessageContainer
      ]}>
        {!isUser && (
          <View style={styles.avatarContainer}>
            <Bot size={20} color="#6366f1" />
          </View>
        )}
        
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
          showRiskIndicator && styles.riskBorder
        ]}>
          {showRiskIndicator && (
            <View style={styles.riskIndicator}>
              <AlertTriangle size={16} color={getRiskColor(msg.riskLevel)} />
              <Text style={[styles.riskText, { color: getRiskColor(msg.riskLevel) }]}>
                {msg.riskLevel.toUpperCase()} RISK DETECTED
              </Text>
            </View>
          )}
          
          <Text style={[
            styles.messageText,
            isUser ? styles.userMessageText : styles.aiMessageText
          ]}>
            {msg.content}
          </Text>
          
          <Text style={[
            styles.timestamp,
            isUser ? styles.userTimestamp : styles.aiTimestamp
          ]}>
            {new Date(msg.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        
        {isUser && (
          <View style={styles.avatarContainer}>
            <User size={20} color="#10b981" />
          </View>
        )}
      </View>
    );
  };

  return (
    <Card style={styles.container} padding={0}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Bot size={24} color="#6366f1" />
          <Text style={styles.headerTitle}>AI Wellness Companion</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Available 24/7 • Confidential • Evidence-based support
        </Text>
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <Bot size={48} color="#6366f1" />
            <Text style={styles.welcomeTitle}>Welcome to your AI Companion</Text>
            <Text style={styles.welcomeText}>
              I'm here to provide support, listen to your concerns, and help you develop 
              healthy coping strategies. Everything you share with me is confidential.
            </Text>
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>You can ask me about:</Text>
              <Text style={styles.suggestion}>• Managing stress and anxiety</Text>
              <Text style={styles.suggestion}>• Coping with difficult emotions</Text>
              <Text style={styles.suggestion}>• Building healthy habits</Text>
              <Text style={styles.suggestion}>• Finding professional help</Text>
            </View>
          </View>
        ) : (
          messages.map(renderMessage)
        )}
        
        {loading && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBubble}>
              <Text style={styles.loadingText}>AI is typing...</Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Share what's on your mind..."
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          placeholderTextColor="#9ca3af"
        />
        <TouchableOpacity
          style={[styles.sendButton, (!message.trim() || loading) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim() || loading}
        >
          <Send size={20} color={!message.trim() || loading ? "#9ca3af" : "#ffffff"} />
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 600,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    backgroundColor: '#fafafa',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  messagesContent: {
    padding: 16,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  suggestionsContainer: {
    alignSelf: 'stretch',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  suggestion: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#f3f4f6',
    borderBottomLeftRadius: 4,
  },
  riskBorder: {
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  riskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#ffffff',
  },
  aiMessageText: {
    color: '#111827',
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: '#e0e7ff',
  },
  aiTimestamp: {
    color: '#9ca3af',
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  loadingBubble: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    marginLeft: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
    maxHeight: 80,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});