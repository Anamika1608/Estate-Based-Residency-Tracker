import { useEffect, useRef, useState } from 'react';
import GetLocation, { isLocationError } from 'react-native-get-location';

type Location = {
    latitude: number;
    longitude: number;
    accuracy: number;
    time: number;
};

export const useLocationTracker = (intervalMinutes: number = 1) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [tracking, setTracking] = useState(false);
    const intervalRef = useRef<NodeJS.Timer | null>(null);

    const getLocation = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 30000,
            rationale: {
                title: 'Location permission',
                message: 'The app needs the permission to request your location.',
                buttonPositive: 'Ok',
            },
        })
            .then(newLocation => {
                console.log(`Location updated at ${new Date().toLocaleTimeString()}:`);
                // console.log(JSON.stringify(newLocation, null, 2));
                console.log('Location accuracy:', newLocation.accuracy, 'meters');
                console.log('Location time:', newLocation.time);
                console.log('Location latitude:', newLocation.latitude);
                console.log('Location longitude:', newLocation.longitude);
                setLocation(newLocation);
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
