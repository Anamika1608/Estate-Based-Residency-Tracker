import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
} from 'react-native';
import { useEffect } from 'react';
import { useLocationTracker } from './src/hooks/useLocationTracker';
import { initializeDatabase } from './src/database/db';
import { database } from './src/database/db';

const App: React.FC = () => {
  const intervalMinutes = 1;
  const {
    location,
    tracking,
    startTracking,
    stopTracking,
  } = useLocationTracker(intervalMinutes);


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
    </View>
  );
}

export default App;

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