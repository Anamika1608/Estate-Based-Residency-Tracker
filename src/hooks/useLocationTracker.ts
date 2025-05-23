import { useEffect, useRef, useState } from 'react';
import GetLocation, { isLocationError } from 'react-native-get-location';
import reverseGeocode from '../hooks/useReverseGeocoder';
import { insertLocation } from '../database/db';
import BackgroundFetch from "react-native-background-fetch";

type Location = {
    latitude: number;
    longitude: number;
    accuracy: number;
    time: number;
};

export const useLocationTracker = (intervalMinutes: number = 5) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [tracking, setTracking] = useState(false);
    const backgroundConfigured = useRef(false);

    const getLocation = async () => {
        try {
            const newLocation = await GetLocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 30000,
                rationale: {
                    title: 'Location permission',
                    message: 'The app needs the permission to request your location.',
                    buttonPositive: 'Ok',
                },
            });

            console.log(`Location updated at ${new Date().toLocaleTimeString()}:`);
            console.log('Location time (formatted):', new Date(newLocation.time).toString());
            const formattedDate = new Date(newLocation.time).toISOString().split('T')[0];
            console.log('Location date:', formattedDate);
            console.log('Location latitude:', newLocation.latitude);
            console.log('Location longitude:', newLocation.longitude);

            setLocation(newLocation);

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

        } catch (ex) {
            if (isLocationError(ex)) {
                const { code, message } = ex;
                console.warn(code, message);
            } else {
                console.warn(ex);
            }
        }
    };

    const configureBackgroundFetch = () => {
        if (backgroundConfigured.current) return;

        BackgroundFetch.configure({
            minimumFetchInterval: intervalMinutes,  // minutes
            enableHeadless: false, 
            startOnBoot: false,    
            stopOnTerminate: true,
        }, async (taskId) => {
            console.log("[BackgroundFetch] task: ", taskId);
            await getLocation();
            BackgroundFetch.finish(taskId);
        }, (error) => {
            console.log("[BackgroundFetch] Failed to configure", error);
        });

        backgroundConfigured.current = true;
    };

    const startTracking = async () => {
        if (tracking) return;

        configureBackgroundFetch();

        setTracking(true);

        await getLocation();

        try {
            await BackgroundFetch.start();
            console.log(`Background location tracking started, updating every ${intervalMinutes} minutes`);
        } catch (error) {
            console.log("[BackgroundFetch] Failed to start", error);
        }
    };

    const stopTracking = async () => {
        try {
            await BackgroundFetch.stop();
            console.log('Background location tracking stopped');
        } catch (error) {
            console.log('Error stopping background fetch:', error);
        }

        setTracking(false);
    };

    useEffect(() => {
        return () => {
        };
    }, []);

    return {
        location,
        tracking,
        startTracking,
        stopTracking,
    };
};