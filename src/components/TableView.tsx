import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { EstateStats } from '../types';

const TableView: React.FC<{
  estateStats: EstateStats[];
  isDarkMode: boolean;
  textColor: string;
}> = ({ estateStats, isDarkMode, textColor }) => {
  // Calculate total days
  const totalDays = estateStats.reduce((sum, stat) => sum + stat.daysSpent, 0);

  return (
    <View style={styles.container}>
      <View style={[
        styles.tableContainer,
        { borderColor: isDarkMode ? '#444' : '#ddd' }
      ]}>
        {/* Table Header */}
        <View style={[
          styles.tableHeader,
          { backgroundColor: isDarkMode ? '#333' : '#f9f9f9' }
        ]}>
          <Text style={[
            styles.headerCell,
            { flex: 3, color: textColor }
          ]}>
            Location
          </Text>
          <Text style={[
            styles.headerCell,
            { flex: 1, textAlign: 'center', color: textColor }
          ]}>
            Days
          </Text>

        </View>

        {estateStats.map((stat, index) => {

          return (
            <View
              key={index}
              style={[
                styles.tableRow,
                { borderTopColor: isDarkMode ? '#444' : '#ddd' },
                index % 2 === 1 && {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                }
              ]}
            >
              <Text
                style={[styles.estateCell, { color: textColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {stat.estate}
              </Text>
              <Text style={[styles.daysCell, { color: textColor }]}>
                {stat.daysSpent}
              </Text>

            </View>
          );
        })}

        {/* Total Row */}
        <View style={[
          styles.totalRow,
          { borderTopColor: isDarkMode ? '#444' : '#ddd', backgroundColor: isDarkMode ? '#333' : '#f9f9f9' }
        ]}>
          <Text style={[styles.totalCell, { color: textColor }]}>
            Total
          </Text>
          <Text style={[styles.totalValueCell, { color: textColor }]}>
            {totalDays}
          </Text>

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  tableContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
  },
  headerCell: {
    fontWeight: '700',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },
  estateCell: {
    flex: 3,
    fontSize: 15,
  },
  daysCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '500',
    fontSize: 15,
  },
  percentCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
  },
  totalRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },
  totalCell: {
    flex: 3,
    fontSize: 16,
    fontWeight: '700',
  },
  totalValueCell: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default TableView;