import SQLite from 'react-native-sqlite-storage';
import { LocationData, EstateStats } from '../types';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

export let database: SQLite.SQLiteDatabase;


export const initializeDatabase = async () => {
  try {
    database = await SQLite.openDatabase({
      name: 'LocationTracker.db',
      location: 'default',
    });

    // Create tables if they don't exist
    await database.executeSql(`
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lat REAL NOT NULL,
        lon REAL NOT NULL,
        time TEXT NOT NULL,
        estate TEXT NOT NULL,
        dayKey TEXT NOT NULL
      );
    `);

    console.log('Database initialized');
    return database;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};


export const getDatabase = async () => {
  if (!database) {
    await initializeDatabase();
  }
  return database;
};


export const insertLocation = async (location: LocationData) => {
  try {
    const db = await getDatabase();

    const [result] = await db.executeSql(
      `INSERT INTO locations (lat, lon, time, estate, dayKey) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        location.lat,
        location.lon,
        location.time,
        location.estate,
        location.dayKey
      ]
    );

    console.log('Inserted location with ID:', result.insertId);
    return result.insertId;
  } catch (error) {
    console.error('Error inserting location:', error);
    throw error;
  }
};

export const getAllLocations = async (): Promise<LocationData[]> => {
  try {
    const db = await getDatabase();
    const [results] = await db.executeSql('SELECT * FROM locations ORDER BY time DESC');

    // console.log("getAllLocations - raw results:", results);
    // console.log("Row count:", results.rows.length);

    const locations: LocationData[] = [];

    for (let i = 0; i < results.rows.length; i++) {
      const item = results.rows.item(i);
      // console.log(`Row ${i}:`, item); 
      locations.push(item);
    }

    console.log("Final locations array:", locations);
    return locations;
  } catch (error) {
    console.error('Error getting locations:', error);
    throw error;
  }
};


export const getEstateStats = async (): Promise<EstateStats[]> => {
  try {
    const db = await getDatabase();

    // Group by estate and dayKey, then count distinct days per estate
    const [results] = await db.executeSql(`
      SELECT 
        estate, 
        COUNT(DISTINCT dayKey) as daysSpent 
      FROM 
        locations 
      GROUP BY 
        estate 
      ORDER BY 
        daysSpent DESC
    `);

    // console.log("getEstateStats: ", results);

    const stats: EstateStats[] = [];

    for (let i = 0; i < results.rows.length; i++) {
      const item = results.rows.item(i)
      // console.log(`Row ${i}:`, item); 
      stats.push(item);
    }

    return stats;
  } catch (error) {
    console.error('Error getting estate stats:', error);
    throw error;
  }
};

export const clearAllLocations = async (): Promise<void> => {
  try {
    const db = await getDatabase();
    await db.executeSql('DELETE FROM locations');
    console.log('All location data cleared');
  } catch (error) {
    console.error('Error clearing locations:', error);
    throw error;
  }
};