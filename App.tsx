import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';
import { useEffect } from 'react';
import { initializeDatabase } from './src/database/db';
import { database } from './src/database/db';
import { NavigationContainer } from '@react-navigation/native';
import StackNavigator from './src/navigation/StackNavigator';

const App: React.FC = () => {

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeDatabase();
        console.log('Database initialized');
      } catch (error) {
        console.error('Error initializing database:', error);
      }
    };

    initialize();

    return () => {
      if (database) {
        database.close()
          .then(() => console.log('Database closed'))
          .catch(error => console.error('Error closing database:', error));
      }
    };
  }, [])


  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}

export default App;

