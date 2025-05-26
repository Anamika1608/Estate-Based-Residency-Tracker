import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
} from 'react-native';
import { EstateStats, LocationData } from '../types';
import { getAllLocations } from '../database/db';

const TableView: React.FC<{
  estateStats: EstateStats[];
  isDarkMode: boolean;
  textColor: string;
}> = ({ estateStats, isDarkMode, textColor }) => {
  const [locationList, setLocationList] = useState<LocationData[]>([]);

  // Fetch all locations from the DB for debugging
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getAllLocations();
        setLocationList(data);
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    };
    fetchLocations();
  }, []);

  const totalDays = estateStats.reduce((sum, stat) => sum + stat.daysSpent, 0);

  return (
    <ScrollView style={styles.container}>
      {/* First Table - Main Display */}
      <View style={[
        styles.tableContainer,
        { borderColor: isDarkMode ? '#444' : '#ddd' }
      ]}>
        <View style={[
          styles.tableHeader,
          { backgroundColor: isDarkMode ? '#333' : '#f9f9f9' }
        ]}>
          <Text style={[styles.headerCell, { flex: 3, color: textColor }]}>
            Location
          </Text>
          <Text style={[styles.headerCell, { flex: 1, textAlign: 'center', color: textColor }]}>
            Days
          </Text>
        </View>

        {estateStats.map((stat, index) => (
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
            <Text style={[styles.estateCell, { color: textColor }]} numberOfLines={1}>
              {stat.estate}
            </Text>
            <Text style={[styles.daysCell, { color: textColor }]}>
              {stat.daysSpent}
            </Text>
          </View>
        ))}

        <View style={[
          styles.totalRow,
          { borderTopColor: isDarkMode ? '#444' : '#ddd', backgroundColor: isDarkMode ? '#333' : '#f9f9f9' }
        ]}>
          <Text style={[styles.totalCell, { color: textColor }]}>Total</Text>
          <Text style={[styles.totalValueCell, { color: textColor }]}>{totalDays}</Text>
        </View>
      </View>

      {/* <View style={[
        styles.tableContainer,
        { marginTop: 20, borderColor: isDarkMode ? '#444' : '#ddd' }
      ]}>
        <View style={[
          styles.tableHeader,
          { backgroundColor: isDarkMode ? '#333' : '#eaeaea' }
        ]}>
          <Text style={[styles.headerCell, { flex: 2, color: textColor }]}>Estate</Text>
          <Text style={[styles.headerCell, { flex: 1.5, color: textColor }]}>Lat</Text>
          <Text style={[styles.headerCell, { flex: 1.5, color: textColor }]}>Lon</Text>
          <Text style={[styles.headerCell, { flex: 2.5, color: textColor }]}>Time</Text>
        </View>

        {locationList.map((loc, index) => (
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
            <Text style={[styles.cell, { flex: 2, color: textColor }]} numberOfLines={1}>
              {loc.estate}
            </Text>
            <Text style={[styles.cell, { flex: 1.5, color: textColor }]}>
              {loc.lat.toFixed(3)}
            </Text>
            <Text style={[styles.cell, { flex: 1.5, color: textColor }]}>
              {loc.lon.toFixed(3)}
            </Text>
            <Text style={[styles.cell, { flex: 2.5, color: textColor }]} numberOfLines={1}>
              {new Date(loc.time).toLocaleString().split(',')[1]}
            </Text>
          </View>
        ))}
      </View> */}
    </ScrollView>
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
    padding: 10,
  },
  headerCell: {
    fontWeight: '700',
    fontSize: 15,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
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
  cell: {
    fontSize: 14,
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
