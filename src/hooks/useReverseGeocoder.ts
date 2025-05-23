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
            `${REVERSE_GEOCODE_URL}?key=${LOCATION_IQ_API_KEY}&lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
        );

        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Error fetching reverse geocode: ${data.message}`);
        }
        if (!data || !data.display_name) {
            throw new Error('No results found');
        }

        const estate = getSmallestEstate(data.address);
        
        return {
            display_name: data.display_name,
            estate: estate,
            full_address: data.address
        };
  
    } catch (error) {
        console.error('Error fetching reverse geocode:', error);
        throw error;
    }
}

const getSmallestEstate = (address) => {
    if (!address) return null;
    
    const priorityFields = [
        'neighbourhood',  
        'hamlet',         
        'suburb',        
        'village',       
        'town',           
        'city_district', 
        'city',           
    ];
    
    for (const field of priorityFields) {
        if (address[field] && address[field].trim() !== '') {
            console.log(`Found smallest estate: ${address[field]} (from field: ${field})`);
            return address[field];
        }
    }
    
    const fallbackEstate = extractEstateFromDisplayName(address.display_name || '');
    console.log(`Using fallback estate from display_name: ${fallbackEstate}`);
    return fallbackEstate;
};

const extractEstateFromDisplayName = (displayName : string) => {
    if (!displayName) return null;
    
    const parts = displayName.split(',').map(part => part.trim());
    
    for (const part of parts) {
        if (
            !/^\d+$/.test(part) && // not just a number
            !/^\d+\s/.test(part) && // doesn't start with number + space
            !/^\d{5}(-\d{4})?$/.test(part) && // not US postal code
            !/^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/.test(part) && // not Canadian postal code
            !/^\d{4,6}$/.test(part) && // not other numeric postal codes
            part.length > 2 && // not too short
            part.length < 50 // not too long (avoid full addresses)
        ) {
            return part;
        }
    }
    
    for (const part of parts) {
        if (!/^\d+$/.test(part) && part.length > 0) {
            return part;
        }
    }
    
    return parts[0] || null;
};

export default reverseGeocode;