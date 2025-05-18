import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    useColorScheme,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';

import { Colors } from 'react-native/Libraries/NewAppScreen';
import { Dimensions } from 'react-native';
import { getEstateStats, clearAllLocations, getAllLocations } from '../database/db';
import { EstateStats } from '../types';
import ChartView from '../components/ChartView';
import TableView from '../components/TableView';

const ResultsScreen: React.FC = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const [estateStats, setEstateStats] = useState<EstateStats[]>([]);
    const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        console.log('ResultsScreen mounted');
        loadEstateStats();
    }, []);

    const loadEstateStats = async () => {
        try {
            setLoading(true);
            const stats = await getEstateStats();
            
            console.log('Loaded estate stats:', stats);
            setEstateStats(stats);
        } catch (error) {
            console.error('Error loading estate stats:', error);
            Alert.alert('Error', 'Failed to load location statistics');
        } finally {
            setLoading(false);
        }
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to delete all location data? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear Data',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await clearAllLocations();
                            setEstateStats([]);
                            Alert.alert('Success', 'All location data has been cleared.');
                        } catch (error) {
                            console.error('Error clearing data:', error);
                            Alert.alert('Error', 'Failed to clear location data');
                        }
                    }
                },
            ]
        );
    };

    const textColor = isDarkMode ? Colors.white : Colors.black;
    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    if (loading) {
        console.log("loading the estate stats");
        return (
            <View style={[styles.container, backgroundStyle, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={[styles.loadingText, { color: textColor }]}>
                    Loading statistics...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, backgroundStyle]}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeView === 'chart' && styles.activeTab,
                        { borderColor: isDarkMode ? '#666' : '#ddd' }
                    ]}
                    onPress={() => setActiveView('chart')}
                >
                    <Text style={[
                        styles.tabText,
                        activeView === 'chart' && styles.activeTabText,
                        { color: activeView === 'chart' ? '#3498db' : textColor }
                    ]}>
                        Chart
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeView === 'table' && styles.activeTab,
                        { borderColor: isDarkMode ? '#666' : '#ddd' }
                    ]}
                    onPress={() => setActiveView('table')}
                >
                    <Text style={[
                        styles.tabText,
                        activeView === 'table' && styles.activeTabText,
                        { color: activeView === 'table' ? '#3498db' : textColor }
                    ]}>
                        Table
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
            >
                {estateStats.length === 0 ? (
                    <View style={styles.noDataContainer}>
                        <Text style={[styles.noDataText, { color: textColor }]}>
                            No location data available.
                        </Text>
                        <Text style={[styles.noDataSubtext, { color: textColor }]}>
                            Start tracking your location to see statistics here.
                        </Text>
                    </View>
                ) : (
                    <>
                        {activeView === 'chart' ? (
                            <ChartView estateStats={estateStats} isDarkMode={isDarkMode} textColor={textColor} />
                        ) : (
                            <TableView estateStats={estateStats} isDarkMode={isDarkMode} textColor={textColor} />
                        )}

                    </>
                )}
            </ScrollView>

            <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearData}
            >
                <Text style={styles.clearButtonText}>Clear All Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadEstateStats}
            >
                <Text style={styles.refreshButtonText}>Refresh Data</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
    },
    tabs: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3498db',
    },
    tabText: {
        fontSize: 16,
        fontWeight: '500',
    },
    activeTabText: {
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
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
    tableContainer: {
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ddd',
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
        borderTopColor: '#ddd',
    },
    estateCell: {
        flex: 3,
        fontSize: 15,
    },
    daysCell: {
        flex: 1,
        textAlign: 'center',
        fontWeight: '600',
        fontSize: 15,
    },
    noDataContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    noDataText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        textAlign: 'center',
    },
    noDataSubtext: {
        fontSize: 14,
        textAlign: 'center',
        opacity: 0.7,
    },
    clearButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 20,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    refreshButton: {
        backgroundColor: '#3498db',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
    },
    refreshButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default ResultsScreen;