import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
} from 'react-native';
import { EstateStats } from '../types';

// This is a safer implementation that doesn't rely on SVG components
const ChartView: React.FC<{
  estateStats: EstateStats[];
  isDarkMode: boolean;
  textColor: string;
}> = ({ estateStats, isDarkMode, textColor }) => {
  // Find the maximum days value for scaling
  const maxDays = Math.max(...estateStats.map(stat => stat.daysSpent), 5); // Minimum of 5 for scale

  return (
    <View style={styles.chartContainer}>
      <Text style={[styles.chartTitle, { color: textColor }]}>
        Time Spent at Different Locations
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { minWidth: estateStats.length > 3 ? undefined : '100%' }
        ]}
      >
        <View style={styles.chartWrapper}>
          {/* Bars Container */}
          <View style={styles.barsContainer}>
            {estateStats.map((stat, index) => {
              const chartHeight = 250; // Full chartWrapper height
              const barHeight = (stat.daysSpent / maxDays) * chartHeight;

              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.verticalBar,
                        {
                          height: barHeight,
                          backgroundColor: getBarColor(index),
                        }
                      ]}
                    >
                      <Text style={styles.barValue}>
                        {stat.daysSpent}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[styles.xAxisLabel, { color: textColor }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {stat.estate}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {estateStats.length > 0 && (
        <View style={styles.legend}>
          <Text style={[styles.legendTitle, { color: textColor }]}>
            Total Days Tracked: {estateStats.reduce((sum, stat) => sum + stat.daysSpent, 0)}
          </Text>
        </View>
      )}
    </View>
  );
};

// Get a color based on index for visual variety
const getBarColor = (index: number) => {
  const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  chartContainer: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollContent: {
    paddingRight: 20,
  },
  chartWrapper: {
    height: 250,
    flexDirection: 'row',
    marginTop: 10,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
  },
  barColumn: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 50,
  },
  barWrapper: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
    paddingBottom: 25, // Space for x-axis labels
  },
  verticalBar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  barValue: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  xAxisLabel: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    width: '100%',
  },
  legend: {
    marginTop: 10,
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ChartView;