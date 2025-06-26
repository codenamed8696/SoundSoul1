import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useData } from '@/context/DataContext';
import { useRouter } from 'expo-router';
import { JournalEntry } from '@/types'; // Make sure JournalEntry type is imported

const JournalScreen = () => {
  const { journalEntries, fetchJournalEntries, loading, deleteJournalEntry, updateJournalEntry } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchJournalEntries();
  }, [fetchJournalEntries]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return journalEntries;
    return journalEntries.filter(
      entry =>
        entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, journalEntries]);

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setEditedTitle(entry.title || '');
    setEditedSummary(entry.summary);
    setEditModalVisible(true);
  };

  const handleUpdate = () => {
    if (!editingEntry) return;
    updateJournalEntry(editingEntry.id, editedTitle, editedSummary);
    setEditModalVisible(false);
    setEditingEntry(null);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJournalEntry(id) },
    ]);
  };

  const getMoodEmoji = (score: number | null | undefined) => {
    if (score === null || score === undefined) return '🤔';
    if (score > 7) return '😊';
    if (score > 4) return '😐';
    return '😔';
  };

  const renderJournalCard = ({ item }: { item: JournalEntry }) => (
    <View style={styles.card}>
        <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood_score_at_time)}</Text>
        </View>
        <Text style={styles.cardSummary}>{item.summary}</Text>
        <View style={styles.themesContainer}>
            {item.key_themes?.map((theme, index) => (
                <View key={index} style={styles.themeTag}>
                    <Text style={styles.themeTagText}>{theme}</Text>
                </View>
            ))}
        </View>
        <View style={styles.cardFooter}>
            <Text style={styles.cardDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                    <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={styles.deleteButton}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    </View>
  );

  if (loading.journalEntries) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (!journalEntries.length) {
    return (
        <View style={styles.center}>
            <Text style={styles.emptyTitle}>Your Journal is Empty</Text>
            <Text style={styles.emptySubtitle}>Create your first entry by talking to your AI companion.</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/(tabs)/chat')}>
                <Text style={styles.emptyButtonText}>Start a Conversation</Text>
            </TouchableOpacity>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search journals..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredEntries}
        renderItem={renderJournalCard}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalBackdrop}>
            <View style={styles.modalView}>
                <Text style={styles.modalTitle}>Edit Journal Entry</Text>
                <TextInput
                    value={editedTitle}
                    onChangeText={setEditedTitle}
                    style={styles.modalInput}
                    placeholder="Entry Title"
                />
                <TextInput
                    value={editedSummary}
                    onChangeText={setEditedSummary}
                    style={[styles.modalInput, styles.modalSummaryInput]}
                    placeholder="Entry Summary"
                    multiline
                />
                <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                        <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdate}>
                        <Text style={styles.modalButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f4f8' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    searchBar: { margin: 16, padding: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },

    // Card Styles
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontWeight: 'bold', fontSize: 18, color: '#1f2937', flex: 1 },
    moodEmoji: { fontSize: 24 },
    cardSummary: { fontSize: 15, color: '#4b5563', lineHeight: 22, marginBottom: 12 },

    // Themes Styles
    themesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    themeTag: { backgroundColor: '#e0e7ff', borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10, marginRight: 6, marginBottom: 6 },
    themeTagText: { color: '#4338ca', fontSize: 12, fontWeight: '500' },

    // Card Footer Styles
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 },
    cardDate: { fontSize: 12, color: '#6b7280' },
    cardActions: { flexDirection: 'row', alignItems: 'center' },
    editButton: { color: '#4f46e5', fontWeight: 'bold', marginRight: 16 },
    deleteButton: { color: '#ef4444', fontWeight: 'bold' },

    // Empty State Styles
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
    emptySubtitle: { fontSize: 16, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
    emptyButton: { backgroundColor: '#6366f1', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 25 },
    emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    // Modal Styles
    modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
    modalInput: { width: '100%', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 16 },
    modalSummaryInput: { height: 100, textAlignVertical: 'top' },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
    modalButton: { borderRadius: 8, padding: 12, flex: 1, alignItems: 'center' },
    cancelButton: { backgroundColor: '#d1d5db', marginRight: 10 },
    saveButton: { backgroundColor: '#6366f1', marginLeft: 10 },
    modalButtonText: { color: 'white', fontWeight: 'bold' }
});

export default JournalScreen; 