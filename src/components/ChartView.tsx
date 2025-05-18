import React from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { EstateStats } from '../types';

interface ChartViewProps {
  estateStats: EstateStats[];
  isDarkMode: boolean;
  textColor: string;
}

const ChartView: React.FC<ChartViewProps> = ({ estateStats, isDarkMode, textColor }) => {
  const screenWidth = Dimensions.get('window').width - 40;

  const chartData = {
    labels: estateStats.map(stat => stat.estate),
    datasets: [
      {
        data: estateStats.map(stat => stat.daysSpent),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? '#222' : '#9eb0e5',
    backgroundGradientTo: isDarkMode ? '#333' : '#f5f5f5',
    color: (opacity = 1) =>
      isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
    fillShadowGradient: isDarkMode ? '#444444' : '#888888',
    fillShadowGradientOpacity: 1,
  };

  return (
    <View style={styles.chartContainer}>
      <Text style={[styles.chartTitle, { color: textColor }]}>
        Days Spent by Estate
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={chartData}
          width={Math.max(screenWidth, estateStats.length * 60)}
          height={320}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          fromZero
          showValuesOnTopOfBars
          yAxisLabel=""
          yAxisSuffix=""
          withInnerLines={false}
          withHorizontalLabels={false}
          style={styles.chart}
        />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 10,
    padding: 10,
  },
});

export default ChartView;