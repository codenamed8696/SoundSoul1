import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, TrendingUp, Calendar, Book, Headphones, Video, Shield, Play, Clock, Star } from 'lucide-react-native';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { WellnessResource } from '@/types';

const moodData = [
  { day: 'Mon', mood: 3.5 },
  { day: 'Tue', mood: 4.0 },
  { day: 'Wed', mood: 3.2 },
  { day: 'Thu', mood: 4.2 },
  { day: 'Fri', mood: 3.8 },
  { day: 'Sat', mood: 4.5 },
  { day: 'Sun', mood: 4.1 },
];

const resourceTypeIcons = {
  meditation: Headphones,
  breathing: Heart,
  journal: Book,
  video: Video,
  article: Book,
  exercise: TrendingUp,
};

const difficultyColors = {
  beginner: '#10b981',
  intermediate: '#f59e0b',
  advanced: '#ef4444',
};

export default function WellnessScreen() {
  const { user } = useAuth();
  const { wellnessResources, getWellnessResources, getUserInsights, loading } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<WellnessResource | null>(null);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    // Fetch wellness resources on component mount
    getWellnessResources();
    
    // Fetch user insights
    if (user) {
      getUserInsights(user.id).then(setInsights);
    }
  }, [user]);

  const categories = ['all', 'Mindfulness', 'Anxiety Relief', 'Stress Relief', 'Positive Psychology', 'Education'];

  const filteredResources = selectedCategory === 'all' 
    ? wellnessResources 
    : wellnessResources.filter(resource => resource.category === selectedCategory);

  const handleResourceSelect = (resource: WellnessResource) => {
    setSelectedResource(resource);
    Alert.alert(
      resource.title,
      `${resource.description}\n\nDuration: ${resource.duration} minutes\nDifficulty: ${resource.difficulty}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => handleStartResource(resource) }
      ]
    );
  };

  const handleStartResource = (resource: WellnessResource) => {
    // In a real app, this would navigate to the resource content
    console.log('Starting resource:', resource.id);
    Alert.alert('Resource Started', `You've started: ${resource.title}`);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    const filters = category === 'all' ? {} : { category };
    getWellnessResources(filters);
  };

  const getResourceIcon = (type: string) => {
    const IconComponent = resourceTypeIcons[type as keyof typeof resourceTypeIcons] || Book;
    return IconComponent;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Wellness Center</Text>
            <Text style={styles.subtitle}>
              Tools and resources for your mental health journey
            </Text>
          </View>
          <View style={styles.privacyBadge}>
            <Shield size={16} color="#10b981" />
            <Text style={styles.privacyText}>Private</Text>
          </View>
        </View>

        {/* Mood Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Mood This Week</Text>
          <Card style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {moodData.map((data, index) => (
                <View key={index} style={styles.chartBar}>
                  <View style={[
                    styles.chartBarFill,
                    { height: `${(data.mood / 5) * 100}%` }
                  ]} />
                  <Text style={styles.chartLabel}>{data.day}</Text>
                </View>
              ))}
            </View>
            <View style={styles.chartFooter}>
              <Text style={styles.chartFooterText}>
                Average: {insights?.moodAverage?.toFixed(1) || '3.8'} • Trend: {insights?.moodTrend || 'stable'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Category Filter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <Pressable
                key={category}
                style={[
                  styles.categoryButton,
                  selectedCategory === category && styles.categoryButtonActive
                ]}
                onPress={() => handleCategoryFilter(category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive
                ]}>
                  {category === 'all' ? 'All' : category}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Wellness Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Resources' : selectedCategory}
          </Text>
          
          {loading.wellnessResources ? (
            <Card style={styles.loadingCard}>
              <Text style={styles.loadingText}>Loading resources...</Text>
            </Card>
          ) : (
            <View style={styles.resourcesGrid}>
              {filteredResources.map((resource) => {
                const IconComponent = getResourceIcon(resource.type);
                return (
                  <Pressable
                    key={resource.id}
                    style={styles.resourceCard}
                    onPress={() => handleResourceSelect(resource)}
                  >
                    {resource.imageUrl && (
                      <View style={styles.resourceImageContainer}>
                        <View style={styles.resourceImagePlaceholder}>
                          <IconComponent size={24} color="#6366f1" />
                        </View>
                        {resource.isPopular && (
                          <View style={styles.popularBadge}>
                            <Star size={12} color="#ffffff" fill="#ffffff" />
                          </View>
                        )}
                      </View>
                    )}
                    
                    <View style={styles.resourceContent}>
                      <Text style={styles.resourceTitle}>{resource.title}</Text>
                      <Text style={styles.resourceDescription} numberOfLines={2}>
                        {resource.description}
                      </Text>
                      
                      <View style={styles.resourceMeta}>
                        <View style={styles.resourceDuration}>
                          <Clock size={14} color="#6b7280" />
                          <Text style={styles.resourceMetaText}>
                            {resource.duration} min
                          </Text>
                        </View>
                        
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: difficultyColors[resource.difficulty] }
                        ]}>
                          <Text style={styles.difficultyText}>
                            {resource.difficulty}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.resourceActions}>
                        <Button
                          title="Start"
                          onPress={() => handleStartResource(resource)}
                          size="small"
                          style={styles.startButton}
                        />
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Daily Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Goals</Text>
          <Card style={styles.goalsCard}>
            <View style={styles.goalItem}>
              <View style={styles.goalCheckbox}>
                <Heart size={16} color="#10b981" />
              </View>
              <Text style={styles.goalText}>Track your mood</Text>
              <Text style={styles.goalStatus}>✓</Text>
            </View>
            
            <View style={styles.goalItem}>
              <View style={styles.goalCheckbox}>
                <Headphones size={16} color="#6b7280" />
              </View>
              <Text style={styles.goalText}>10 minutes of meditation</Text>
              <Text style={styles.goalStatus}>○</Text>
            </View>
            
            <View style={styles.goalItem}>
              <View style={styles.goalCheckbox}>
                <Book size={16} color="#6b7280" />
              </View>
              <Text style={styles.goalText}>Write in wellness journal</Text>
              <Text style={styles.goalStatus}>○</Text>
            </View>
          </Card>
        </View>

        {/* Insights & Tips */}
        {insights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personalized Insights</Text>
            <Card style={styles.insightsCard}>
              <View style={styles.insightHeader}>
                <TrendingUp size={24} color="#6366f1" />
                <Text style={styles.insightTitle}>Your Progress</Text>
              </View>
              <Text style={styles.insightText}>
                You've been consistently tracking your mood for {insights.streakDays} days. 
                Your mood trend is {insights.moodTrend}, which shows great progress in your wellness journey.
              </Text>
              <View style={styles.recommendationsContainer}>
                <Text style={styles.recommendationsTitle}>Recommendations:</Text>
                {insights.recommendations.map((recommendation: string, index: number) => (
                  <Text key={index} style={styles.recommendationItem}>
                    • {recommendation}
                  </Text>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Emergency Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Crisis Support</Text>
          <Card style={styles.crisisCard}>
            <Text style={styles.crisisTitle}>Need immediate help?</Text>
            <Text style={styles.crisisText}>
              If you're having thoughts of self-harm or suicide, please reach out for help immediately.
            </Text>
            <View style={styles.crisisActions}>
              <Button
                title="Crisis Hotline: 988"
                onPress={() => console.log('Call crisis hotline')}
                style={styles.crisisButton}
              />
              <Button
                title="Emergency Services"
                onPress={() => console.log('Call emergency')}
                variant="secondary"
                style={styles.crisisButton}
              />
            </View>
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
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
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
    fontFamily: 'Inter-SemiBold',
    marginLeft: 6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 16,
  },
  chartCard: {
    padding: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    marginBottom: 16,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  chartBarFill: {
    backgroundColor: '#6366f1',
    width: '80%',
    borderRadius: 4,
    minHeight: 8,
  },
  chartLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginTop: 8,
  },
  chartFooter: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  chartFooterText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  categoriesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  categoryButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  loadingCard: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
  },
  resourcesGrid: {
    gap: 16,
  },
  resourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resourceImageContainer: {
    height: 120,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  resourceImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#f59e0b',
    borderRadius: 12,
    padding: 6,
  },
  resourceContent: {
    padding: 16,
  },
  resourceTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  resourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resourceDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceMetaText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  resourceActions: {
    flexDirection: 'row',
  },
  startButton: {
    flex: 1,
  },
  goalsCard: {
    padding: 20,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
  },
  goalStatus: {
    fontSize: 18,
    color: '#10b981',
  },
  insightsCard: {
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    marginLeft: 12,
  },
  insightText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 24,
    marginBottom: 16,
  },
  recommendationsContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  recommendationsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 4,
  },
  crisisCard: {
    padding: 20,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  crisisTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  crisisText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
  },
  crisisActions: {
    gap: 8,
  },
  crisisButton: {
    backgroundColor: '#dc2626',
  },
  bottomSpacing: {
    height: 20,
  },
});