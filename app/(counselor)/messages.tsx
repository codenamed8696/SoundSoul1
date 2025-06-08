import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Search, Send, Shield, Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

// Demo conversations data
const conversations = [
  {
    id: 'conv-1',
    clientId: 'Client #A7B2C9',
    lastMessage: 'Thank you for the breathing exercises. They really helped during my panic attack yesterday.',
    timestamp: '2024-12-05T14:30:00Z',
    unread: true,
    riskLevel: 'medium',
    priority: 'normal',
  },
  {
    id: 'conv-2',
    clientId: 'Client #D4E8F1',
    lastMessage: 'I\'ve been practicing the communication techniques we discussed. My partner and I had a much better conversation last night.',
    timestamp: '2024-12-05T10:15:00Z',
    unread: false,
    riskLevel: 'low',
    priority: 'normal',
  },
  {
    id: 'conv-3',
    clientId: 'Client #G9H3K6',
    lastMessage: 'I\'m having really dark thoughts again. Can we schedule an emergency session?',
    timestamp: '2024-12-05T08:45:00Z',
    unread: true,
    riskLevel: 'high',
    priority: 'urgent',
  },
  {
    id: 'conv-4',
    clientId: 'Client #M2N7P4',
    lastMessage: 'The CBT homework you gave me is helping. I\'m starting to notice my thought patterns more.',
    timestamp: '2024-12-04T16:20:00Z',
    unread: false,
    riskLevel: 'low',
    priority: 'normal',
  },
];

// Demo messages for selected conversation
const demoMessages = [
  {
    id: 'msg-1',
    senderId: 'Client #G9H3K6',
    senderType: 'client',
    content: 'I\'m having really dark thoughts again. Can we schedule an emergency session?',
    timestamp: '2024-12-05T08:45:00Z',
    riskLevel: 'high',
  },
  {
    id: 'msg-2',
    senderId: 'counselor',
    senderType: 'counselor',
    content: 'I\'m very concerned about what you\'re sharing. I want you to know that I\'m here to support you. Let\'s schedule an emergency session today. In the meantime, please remember the safety plan we created together.',
    timestamp: '2024-12-05T08:50:00Z',
  },
  {
    id: 'msg-3',
    senderId: 'counselor',
    senderType: 'counselor',
    content: 'I\'ve scheduled an emergency session for 2 PM today. If you need immediate support before then, please call the crisis hotline: 988. You are not alone in this.',
    timestamp: '2024-12-05T08:52:00Z',
  },
];

export default function CounselorMessagesScreen() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#dc2626';
      case 'high': return '#ea580c';
      case 'normal': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  if (selectedConversation) {
    const conversation = conversations.find(c => c.id === selectedConversation);
    if (!conversation) return null;

    return (
      <SafeAreaView style={styles.container}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <Pressable 
            style={styles.backButton}
            onPress={() => setSelectedConversation(null)}
          >
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderTitle}>{conversation.clientId}</Text>
            <View style={styles.chatHeaderMeta}>
              <View style={[
                styles.riskIndicator,
                { backgroundColor: getRiskColor(conversation.riskLevel) }
              ]}>
                <Text style={styles.riskText}>
                  {conversation.riskLevel.toUpperCase()}
                </Text>
              </View>
              {conversation.priority === 'urgent' && (
                <View style={styles.urgentIndicator}>
                  <AlertTriangle size={16} color="#dc2626" />
                  <Text style={styles.urgentText}>URGENT</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.privacyBadge}>
            <Shield size={16} color="#10b981" />
          </View>
        </View>

        {/* Messages */}
        <ScrollView style={styles.messagesContainer} contentContainerStyle={styles.messagesContent}>
          {demoMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.senderType === 'counselor' ? styles.counselorMessage : styles.clientMessage
              ]}
            >
              {message.riskLevel && message.riskLevel !== 'low' && (
                <View style={styles.messageRiskIndicator}>
                  <AlertTriangle size={16} color={getRiskColor(message.riskLevel)} />
                  <Text style={[
                    styles.messageRiskText,
                    { color: getRiskColor(message.riskLevel) }
                  ]}>
                    {message.riskLevel.toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={[
                styles.messageText,
                message.senderType === 'counselor' ? styles.counselorMessageText : styles.clientMessageText
              ]}>
                {message.content}
              </Text>
              <Text style={[
                styles.messageTime,
                message.senderType === 'counselor' ? styles.counselorMessageTime : styles.clientMessageTime
              ]}>
                {formatTime(message.timestamp)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Message Input */}
        <View style={styles.messageInputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your response..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={20} color={!newMessage.trim() ? "#9ca3af" : "#ffffff"} />
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Messages</Text>
            <Text style={styles.subtitle}>
              Secure communication with your clients
            </Text>
          </View>
          <View style={styles.privacyBadge}>
            <Shield size={16} color="#10b981" />
            <Text style={styles.privacyText}>Encrypted</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.section}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search conversations..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <Card style={styles.statCard}>
              <MessageCircle size={24} color="#6366f1" />
              <Text style={styles.statValue}>
                {conversations.filter(c => c.unread).length}
              </Text>
              <Text style={styles.statLabel}>Unread</Text>
            </Card>

            <Card style={styles.statCard}>
              <AlertTriangle size={24} color="#ef4444" />
              <Text style={styles.statValue}>
                {conversations.filter(c => c.priority === 'urgent').length}
              </Text>
              <Text style={styles.statLabel}>Urgent</Text>
            </Card>

            <Card style={styles.statCard}>
              <Clock size={24} color="#f59e0b" />
              <Text style={styles.statValue}>
                {conversations.filter(c => c.riskLevel === 'high').length}
              </Text>
              <Text style={styles.statLabel}>High Risk</Text>
            </Card>
          </View>
        </View>

        {/* Conversations List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversations</Text>
          <View style={styles.conversationsList}>
            {filteredConversations.map((conversation) => (
              <Pressable
                key={conversation.id}
                style={[
                  styles.conversationCard,
                  conversation.unread && styles.conversationCardUnread
                ]}
                onPress={() => setSelectedConversation(conversation.id)}
              >
                <View style={styles.conversationHeader}>
                  <Text style={[
                    styles.conversationClient,
                    conversation.unread && styles.conversationClientUnread
                  ]}>
                    {conversation.clientId}
                  </Text>
                  <View style={styles.conversationMeta}>
                    <Text style={styles.conversationTime}>
                      {formatDate(conversation.timestamp)}
                    </Text>
                    {conversation.unread && (
                      <View style={styles.unreadDot} />
                    )}
                  </View>
                </View>

                <Text style={[
                  styles.conversationMessage,
                  conversation.unread && styles.conversationMessageUnread
                ]} numberOfLines={2}>
                  {conversation.lastMessage}
                </Text>

                <View style={styles.conversationFooter}>
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: getRiskColor(conversation.riskLevel) }
                  ]}>
                    <Text style={styles.riskBadgeText}>
                      {conversation.riskLevel.toUpperCase()}
                    </Text>
                  </View>
                  {conversation.priority === 'urgent' && (
                    <View style={styles.priorityBadge}>
                      <AlertTriangle size={12} color="#dc2626" />
                      <Text style={styles.priorityText}>URGENT</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Privacy Notice */}
        <View style={styles.section}>
          <Card style={styles.privacyCard}>
            <View style={styles.privacyHeader}>
              <Shield size={24} color="#6366f1" />
              <Text style={styles.privacyTitle}>End-to-End Encryption</Text>
            </View>
            <Text style={styles.privacyDescription}>
              All messages are encrypted and secure. Client identities remain 
              anonymous while ensuring you can provide the best possible care.
            </Text>
          </Card>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  privacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  privacyText: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
    fontSize: 16,
    color: '#111827',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  conversationsList: {
    gap: 12,
  },
  conversationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  conversationCardUnread: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f9ff',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  conversationClient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  conversationClientUnread: {
    color: '#111827',
    fontWeight: '700',
  },
  conversationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conversationTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginRight: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
  },
  conversationMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  conversationMessageUnread: {
    color: '#374151',
  },
  conversationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  privacyCard: {
    padding: 20,
    backgroundColor: '#f0f9ff',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  privacyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 12,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  // Chat view styles
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  backText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '600',
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  chatHeaderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  riskIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  urgentIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  urgentText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 16,
    padding: 12,
  },
  counselorMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  clientMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  messageRiskIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  messageRiskText: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  counselorMessageText: {
    color: '#ffffff',
  },
  clientMessageText: {
    color: '#111827',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  counselorMessageTime: {
    color: '#e0e7ff',
  },
  clientMessageTime: {
    color: '#9ca3af',
  },
  messageInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
    maxHeight: 100,
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
  bottomSpacing: {
    height: 20,
  },
});