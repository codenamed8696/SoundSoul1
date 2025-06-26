import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useData } from '@/context/DataContext';

const JournalScreen = () => {
  const { journalEntries, fetchJournalEntries, loading, deleteJournalEntry } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJournalEntries();
  }, [fetchJournalEntries]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery) return journalEntries;
    return journalEntries.filter(
      entry =>
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.summary.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, journalEntries]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete Entry?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteJournalEntry(id) },
    ]);
  };

  if (loading.journalEntries) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (!journalEntries.length) {
    return <View style={styles.center}><Text>No journal entries yet.</Text></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search journal..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredEntries}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
            <Text style={styles.themes}>Themes: {item.key_themes.join(', ')}</Text>
            {item.mood_score_at_time !== null && (
              <Text style={styles.mood}>Mood Score: {item.mood_score_at_time}</Text>
            )}
            <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => { /* handle edit later */ }}>
                <Text style={styles.editButton}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 4 },
  summary: { fontSize: 15, marginBottom: 6 },
  themes: { fontSize: 13, color: '#6366F1', marginBottom: 4 },
  mood: { fontSize: 13, color: '#10B981', marginBottom: 4 },
  date: { fontSize: 12, color: '#888' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchBar: {
    margin: 16,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  editButton: {
    color: '#6366F1',
    marginRight: 20,
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteButton: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default JournalScreen; 