import { LOCATION_IQ_API_KEY } from "@env"

const REVERSE_GEOCODE_URL = 'https://us1.locationiq.com/v1/reverse'

const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
        console.log('Fetching reverse geocode for:', latitude, longitude);
        console.log('LOCATION_IQ_API_KEY:', LOCATION_IQ_API_KEY);
        
        if (!latitude || !longitude) {
            throw new Error('Invalid latitude or longitude');
        }
        if (!LOCATION_IQ_API_KEY) {
            throw new Error('LOCATION_IQ_API_KEY is not defined');
        }
        const response = await fetch(
            `${REVERSE_GEOCODE_URL}?key=${LOCATION_IQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error fetching reverse geocode: ${data.message}`);
        }
        if (!data || !data.display_name) {
            throw new Error('No results found');
        }

        const display_name = data.display_name;
        return display_name;
  
    } catch (error) {
        console.error('Error fetching reverse geocode:', error);
        throw error;
    }
}

export default reverseGeocode;