import axios from 'axios';

const API_URL = 'http://localhost:3002/api/synagogue';

// Add console logging for token debugging
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found when calling synagogue service');
    return {};
  }
  console.log('Using token for synagogue API call:', token.substring(0, 15) + '...');
  return { Authorization: `Bearer ${token}` };
};

// Legacy API methods
export const getSynagogueLocation = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error in getSynagogueLocation:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'שגיאה בטעינת מיקום בית הכנסת');
  }
};

export const updateSynagogueLocation = async (locationData) => {
  try {
    const headers = getAuthHeader();
    console.log('Updating synagogue location with headers:', headers);
    
    const response = await axios.put(API_URL, locationData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error in updateSynagogueLocation:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'שגיאה בעדכון מיקום בית הכנסת');
  }
};

// New V2 API methods
export const getSynagogueData = async () => {
  try {
    const response = await axios.get(`${API_URL}/v2`);
    return response.data;
  } catch (error) {
    console.error('Error in getSynagogueData:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'שגיאה בטעינת מידע בית הכנסת');
  }
};

export const updateSynagogueData = async (synagogueData) => {
  try {
    const headers = getAuthHeader();
    console.log('Updating synagogue data with headers:', headers);
    
    const response = await axios.post(`${API_URL}/update`, synagogueData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error in updateSynagogueData:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'שגיאה בעדכון מידע בית הכנסת');
  }
};

export const getNavigationLinks = (latitude, longitude) => {
  return {
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    waze: `https://www.waze.com/ul?ll=${latitude},${longitude}&navigate=yes`,
    googleMapsWalking: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`
  };
}; 