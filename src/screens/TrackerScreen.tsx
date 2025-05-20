import React from 'react'
import {
    StyleSheet,
    Text,
    View,
    Button,
} from 'react-native';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

const TrackerScreen: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const intervalMinutes = 5;
    const {
        location,
        tracking,
        startTracking,
        stopTracking,
    } = useLocationTracker(intervalMinutes);

    const getLocationChart = () => {
        navigation.navigate('Charts');
    };

    return (
        <View style={styles.container}>

            <View style={styles.button}>
                <Button
                    disabled={tracking}
                    title={`Start Tracking`}
                    onPress={startTracking}
                />
            </View>

            {tracking && (
                <View style={styles.button}>
                    <Button title="Stop Tracking" onPress={stopTracking} />
                </View>
            )}

            <View style={styles.button}>
                <Button
                    title={`Get charts`}
                    onPress={getLocationChart}
                />
            </View>

        </View>
    )
}

export default TrackerScreen


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
        padding: 20,
    },
    locationContainer: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        fontWeight: 'bold',
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    location: {
        color: '#333333',
        marginBottom: 5,
        fontSize: 16,
    },
    button: {
        marginBottom: 15,
        width: '80%',
    },
});