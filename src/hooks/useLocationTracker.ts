import { useEffect, useRef, useState } from 'react';
import GetLocation, { isLocationError } from 'react-native-get-location';
import reverseGeocode from '../hooks/useReverseGeocoder';
import { insertLocation } from '../database/db';

type Location = {
    latitude: number;
    longitude: number;
    accuracy: number;
    time: number;
};

export const useLocationTracker = (intervalMinutes: number = 5) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [tracking, setTracking] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const getLocation = async () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000,
            rationale: {
                title: 'Location permission',
                message: 'The app needs the permission to request your location.',
                buttonPositive: 'Ok',
            },
        })
            .then(async newLocation => {

                console.log(`Location updated at ${new Date().toLocaleTimeString()}:`);
                // console.log(JSON.stringify(newLocation, null, 2));
                console.log('Location time (formatted):', new Date(newLocation.time).toString());
                const formattedDate = new Date(newLocation.time).toISOString().split('T')[0];
                console.log('Location date:', formattedDate);
                console.log('Location latitude:', newLocation.latitude);
                console.log('Location longitude:', newLocation.longitude);
                setLocation(newLocation);
                const estate = await reverseGeocode(newLocation.latitude, newLocation.longitude);
                console.log(estate)
                const estateName = estate.split(',')[0];
                console.log('Estate name:', estateName);

                const locationData = {
                    lat: newLocation.latitude,
                    lon: newLocation.longitude,
                    time: new Date().toISOString(),
                    estate: estateName,
                    dayKey: new Date(newLocation.time).toISOString().split('T')[0],
                };

                await insertLocation(locationData).then(() => {
                    console.log('Location data inserted into database:', locationData);
                }).catch(error => {
                    console.error('Error inserting location data into database:', error);
                });
            })
            .catch(ex => {
                if (isLocationError(ex)) {
                    const { code, message } = ex;
                    console.warn(code, message);
                } else {
                    console.warn(ex);
                }
            });
    };

    const startTracking = () => {
        if (tracking) return;

        setTracking(true);
        getLocation();

        const intervalMs = intervalMinutes * 60 * 1000;

        intervalRef.current = setInterval(() => {
            getLocation();
        }, intervalMs);

        console.log(`Location tracking started, updating every ${intervalMinutes} minutes`);
    };

    const stopTracking = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setTracking(false);
        console.log('Location tracking stopped');
    };

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    return {
        location,
        tracking,
        startTracking,
        stopTracking,
    };
};


