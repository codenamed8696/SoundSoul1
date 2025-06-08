import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Smile, Meh, Frown } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useData } from '@/context/DataContext';

const MOOD_LABELS = ['Very Bad', 'Bad', 'Okay', 'Good', 'Great'];
const MOOD_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06d6a0'];

export function MoodTracker() {
  const { addMoodEntry } = useData();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (selectedMood !== null) {
      setLoading(true);
      const success = await addMoodEntry(selectedMood, notes);
      setLoading(false);
      
      if (success) {
        setSubmitted(true);
        setSelectedMood(null);
        setNotes('');
        
        // Reset after 2 seconds
        setTimeout(() => setSubmitted(false), 2000);
      } else {
        Alert.alert('Error', 'Failed to record mood. Please try again.');
      }
    }
  };

  const getMoodIcon = (mood: number) => {
    if (mood <= 2) return <Frown size={32} color={MOOD_COLORS[mood - 1]} />;
    if (mood === 3) return <Meh size={32} color={MOOD_COLORS[mood - 1]} />;
    return <Smile size={32} color={MOOD_COLORS[mood - 1]} />;
  };

  if (submitted) {
    return (
      <Card>
        <View style={styles.successContainer}>
          <Smile size={48} color="#22c55e" />
          <Text style={styles.successTitle}>Mood Recorded!</Text>
          <Text style={styles.successSubtitle}>Thank you for tracking your mood today</Text>
        </View>
      </Card>
    );
  }

  return (
    <Card>
      <Text style={styles.title}>How are you feeling today?</Text>
      <Text style={styles.subtitle}>Your daily check-in helps us provide better support</Text>
      
      <View style={styles.moodScale}>
        {[1, 2, 3, 4, 5].map((mood) => (
          <TouchableOpacity
            key={mood}
            style={[
              styles.moodButton,
              selectedMood === mood && styles.selectedMoodButton,
              { borderColor: MOOD_COLORS[mood - 1] }
            ]}
            onPress={() => setSelectedMood(mood)}
            disabled={loading}
          >
            {getMoodIcon(mood)}
            <Text style={[
              styles.moodLabel,
              { color: MOOD_COLORS[mood - 1] },
              selectedMood === mood && styles.selectedMoodLabel
            ]}>
              {MOOD_LABELS[mood - 1]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.notesContainer}>
        <Text style={styles.notesLabel}>Additional notes (optional)</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="How are you feeling? What's on your mind?"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          placeholderTextColor="#9ca3af"
          editable={!loading}
        />
      </View>
      
      <Button
        title={loading ? "Recording..." : "Record Mood"}
        onPress={handleSubmit}
        disabled={selectedMood === null || loading}
        style={styles.submitButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  moodScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  moodButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#fafafa',
  },
  selectedMoodButton: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
  },
  moodLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  selectedMoodLabel: {
    fontWeight: '700',
  },
  notesContainer: {
    marginBottom: 24,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});