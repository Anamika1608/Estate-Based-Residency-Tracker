import { useEffect, useRef, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import reverseGeocode from '../hooks/useReverseGeocoder';
import { insertLocation } from '../database/db';
import BackgroundFetch from "react-native-background-fetch";

type Location = {
    latitude: number;
    longitude: number;
    accuracy: number;
    time: number;
};

const sleep = (time: number) => new Promise<void>((resolve) => setTimeout(resolve, time));

export const useLocationTracker = (intervalMinutes: number = 15) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [tracking, setTracking] = useState(false);
    const [permissionsGranted, setPermissionsGranted] = useState(false);
    const [backgroundFetchStatus, setBackgroundFetchStatus] = useState<string>('');
    const backgroundConfigured = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check if permissions are already granted
    const checkPermissions = async (): Promise<boolean> => {
        if (Platform.OS !== 'android') {
            return true;
        }

        try {
            const locationGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
            const coarseLocationGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION);
            const backgroundLocationGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
            const notificationsGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

            const allGranted = locationGranted && coarseLocationGranted && backgroundLocationGranted && notificationsGranted;
            setPermissionsGranted(allGranted);
            return allGranted;
        } catch (error) {
            console.log('Error checking permissions:', error);
            return false;
        }
    };

    // Request multiple permissions function
    const requestMultiplePermissions = async (): Promise<boolean> => {

        try {
            const alreadyGranted = await checkPermissions();
            if (alreadyGranted) {
                console.log('All permissions already granted');
                return true;
            }

            console.log('Requesting location permissions first...');

            const basicLocationPermissions = [
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            ];

            const basicGranted = await PermissionsAndroid.requestMultiple(basicLocationPermissions);

            const locationGranted = basicGranted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
            const coarseLocationGranted = basicGranted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;

            if (!locationGranted || !coarseLocationGranted) {
                console.log('Basic location permissions denied');
                console.log('Fine Location:', locationGranted);
                console.log('Coarse Location:', coarseLocationGranted);
                return false;
            }

            console.log('Basic location permissions granted, requesting background permission...');

            const backgroundResult = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
                {
                    title: 'Background Location Permission',
                    message: 'This app needs background location access to track your location when the app is not active.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );

            const backgroundLocationGranted = backgroundResult === PermissionsAndroid.RESULTS.GRANTED;

            console.log('Background location granted:', backgroundLocationGranted);

            const allPermissionsGranted = locationGranted && coarseLocationGranted && backgroundLocationGranted;

            if (allPermissionsGranted) {
                console.log('All requested permissions granted');
                setPermissionsGranted(true);
                return true;
            } else {
                console.log('One or more permissions denied');
                console.log('Location:', locationGranted);
                console.log('Coarse Location:', coarseLocationGranted);
                console.log('Background Location:', backgroundLocationGranted);
                setPermissionsGranted(false);
                return false;
            }
        } catch (err) {
            console.warn('Permission request error:', err);
            setPermissionsGranted(false);
            return false;
        }
    };

    const getCurrentPositionAndSave = async (): Promise<Location | null> => {
        return new Promise((resolve) => {
            try {
                Geolocation.getCurrentPosition(
                    async (position) => {
                        console.log('Location retrieved:', position);
                        
                        const newLocation: Location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy || 0,
                            time: position.timestamp,
                        };

                        console.log(`Location updated at ${new Date().toLocaleTimeString()}:`);
                        console.log('Location time (formatted):', new Date(newLocation.time).toString());
                        const formattedDate = new Date(newLocation.time).toISOString().split('T')[0];
                        console.log('Location date:', formattedDate);
                        console.log('Location latitude:', newLocation.latitude);
                        console.log('Location longitude:', newLocation.longitude);

                        setLocation(newLocation);

                        try {
                            const reverseGeoData = await reverseGeocode(newLocation.latitude, newLocation.longitude);
                            console.log('reverseGeoData:', reverseGeoData);

                            const locationData = {
                                lat: newLocation.latitude,
                                lon: newLocation.longitude,
                                time: new Date().toISOString(),
                                estate: reverseGeoData.estate,
                                dayKey: new Date(newLocation.time).toISOString().split('T')[0],
                            };

                            await insertLocation(locationData);
                            console.log('Location data inserted into database:', locationData);

                            resolve(newLocation);
                        } catch (geoError) {
                            console.log('Error with reverse geocoding or database insertion:', geoError);
                            resolve(newLocation); 
                        }
                    },
                    (error) => {
                        console.log('Geolocation error:', error.code, error.message);
                        resolve(null);
                    },
                    { 
                        enableHighAccuracy: true, 
                        timeout: 30000, 
                        maximumAge: 10000,
                        showLocationDialog: true,
                        forceRequestLocation: true,
                        forceLocationManager: false,
                        distanceFilter: 0
                    }
                );
            } catch (error) {
                console.log('Error getting current position:', error);
                resolve(null);
            }
        });
    };

    const initBackgroundFetch = async (): Promise<void> => {
        if (backgroundConfigured.current) {
            console.log('BackgroundFetch already configured');
            return;
        }

        const onEvent = async (taskId: string) => {
            console.log('[BackgroundFetch] task: ', taskId);

            try {
                await getCurrentPositionAndSave();
                console.log('[BackgroundFetch] Location task completed successfully');
            } catch (error) {
                console.log('[BackgroundFetch] Error in location task:', error);
            }

            BackgroundFetch.finish(taskId);
        };

        const onTimeout = async (taskId: string) => {
            console.warn('[BackgroundFetch] TIMEOUT task: ', taskId);
            BackgroundFetch.finish(taskId);
        };

        try {
            const status = await BackgroundFetch.configure(
                {
                    minimumFetchInterval: intervalMinutes, // minutes
                    enableHeadless: true,
                    stopOnTerminate: false,
                    startOnBoot: true,
                    requiredNetworkType: 0, // NONE
                    requiresCharging: false,
                    requiresDeviceIdle: false,
                    requiresBatteryNotLow: false,
                    requiresStorageNotLow: false,
                },
                onEvent,
                onTimeout
            );

            console.log('[BackgroundFetch] configure status: ', status);
            setBackgroundFetchStatus(status.toString());
            backgroundConfigured.current = true;

        } catch (error) {
            console.log('[BackgroundFetch] configure error: ', error);
            setBackgroundFetchStatus('Error');
        }
    };

    const startTracking = async () => {
        if (tracking) {
            console.log('Already tracking');
            return;
        }

        console.log('Requesting permissions...');
        const hasPermissions = await requestMultiplePermissions();

        if (!hasPermissions) {
            console.log('Permissions not granted. Cannot start tracking.');
            return;
        }

        console.log('Starting location tracking...');
        setTracking(true);

        try {
            await initBackgroundFetch();

            console.log('Getting initial location...');
            const initialLocation = await getCurrentPositionAndSave();

            if (!initialLocation) {
                console.log('Failed to get initial location');
                setTracking(false);
                return;
            }

            await BackgroundFetch.start();
            console.log('[BackgroundFetch] started successfully');

            console.log('Location tracking started successfully!');

        } catch (error) {
            console.log('Error starting location tracking:', error);
            setTracking(false);
        }
    };

    const stopTracking = async () => {
        if (!tracking) {
            console.log('Not currently tracking');
            return;
        }

        try {
            console.log('Stopping location tracking...');

            await BackgroundFetch.stop();
            console.log('[BackgroundFetch] stopped successfully');

            setTracking(false);
            backgroundConfigured.current = false;

            console.log('Location tracking stopped successfully!');
        } catch (error) {
            console.log('Error stopping location tracking:', error);
        }
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            stopTracking();
        };
    }, []);

    return {
        location,
        tracking,
        permissionsGranted,
        backgroundFetchStatus,
        startTracking,
        stopTracking,
        requestPermissions: requestMultiplePermissions,
        checkPermissions,
    };
};