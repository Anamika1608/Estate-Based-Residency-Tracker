import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TrackerScreen from '../screens/TrackerScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="Tracker">
            <Stack.Screen name="Tracker" component={TrackerScreen} />
            <Stack.Screen name="Charts" component={ResultsScreen} />
        </Stack.Navigator>
    );
};

export default StackNavigator;
