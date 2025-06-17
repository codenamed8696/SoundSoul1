import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { MoodEntry } from '@/types';
import { format } from 'date-fns';

interface MoodChartProps {
  data: MoodEntry[];
  timeframe: 'day' | 'week' | 'month';
}

export const MoodChart = ({ data, timeframe }: MoodChartProps) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No mood entries for this period.</Text>
      </View>
    );
  }

  // Helper to format labels based on the timeframe
  const formatLabel = (date: string) => {
    if (timeframe === 'day') return format(new Date(date), 'ha'); // Hour (e.g., 8a)
    if (timeframe === 'week') return format(new Date(date), 'EEE'); // Day of week (e.g., Mon)
    return format(new Date(date), 'd'); // Day of month (e.g., 15)
  };
  
  const chartData = {
    labels: data.map(entry => formatLabel(entry.created_at)),
    datasets: [
      {
        data: data.map(entry => entry.mood_score),
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.chartContainer}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 48} // from screen Dimensions
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#4f46e5',
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  emptyContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
});