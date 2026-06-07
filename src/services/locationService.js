import * as Location from 'expo-location';
import { Alert } from 'react-native';

// Ongwediva coordinates (center of town)
const ONGWEDIVA_COORDINATES = {
  latitude: -17.7833,
  longitude: 15.7667
};

const MAX_DISTANCE_KM = 15; // 15km radius

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get current user location
export const getCurrentLocation = async () => {
  try {
    // Request permission
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to use this app');
      return null;
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude
    };
  } catch (error) {
    console.error('Location error:', error);
    return null;
  }
};

// Verify if user is within Ongwediva
export const isWithinOngwediva = async () => {
  const userLocation = await getCurrentLocation();
  
  if (!userLocation) {
    return false;
  }
  
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    ONGWEDIVA_COORDINATES.latitude,
    ONGWEDIVA_COORDINATES.longitude
  );
  
  const isValid = distance <= MAX_DISTANCE_KM;
  
  console.log(`Distance from Ongwediva: ${distance.toFixed(2)}km`);
  console.log(`Within Ongwediva: ${isValid}`);
  
  return isValid;
};

// Get distance message for debugging
export const getDistanceMessage = async () => {
  const userLocation = await getCurrentLocation();
  
  if (!userLocation) {
    return 'Could not determine location';
  }
  
  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    ONGWEDIVA_COORDINATES.latitude,
    ONGWEDIVA_COORDINATES.longitude
  );
  
  return `You are ${distance.toFixed(2)}km from Ongwediva. ${distance <= MAX_DISTANCE_KM ? '✅ Access granted' : '❌ Access denied'}`;
};

export { MAX_DISTANCE_KM, ONGWEDIVA_COORDINATES };