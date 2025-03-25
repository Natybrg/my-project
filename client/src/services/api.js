import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002',
});

// Add a request interceptor to add the token to each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  
  console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.dispatchEvent(new Event('userChange'));
    }
    return Promise.reject(error);
  }
);

export const login = async (phone, password) => {
  try {
    const response = await api.post('/api/auth/login', { phone, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error.response) {
      // The server responded with a status code outside the 2xx range
      if (error.response.data && error.response.data.errors) {
        // If the server returned an array of errors, join them into a single message
        throw new Error(error.response.data.errors.join(', '));
      } else if (error.response.data && error.response.data.message) {
        // If the server returned a specific error message
        throw new Error(error.response.data.message);
      } else {
        throw new Error('שגיאה בהתחברות. אנא נסה שנית.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('לא התקבלה תגובה מהשרת. אנא בדוק את החיבור לאינטרנט.');
    } else {
      // Something happened in setting up the request
      throw new Error('שגיאה בשליחת הבקשה: ' + error.message);
    }
  }
};

// פונקציה חדשה לקבלת פרטי המשתמש
export const getUserDetails = async (userId) => {
  try {
    const response = await api.get(`/api/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בקבלת פרטי המשתמש' };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: 'אירעה שגיאה בהתחברות לשרת' };
    }
  }
};

// Update payment status (full payment)
export const updatePaymentStatus = async (paymentId, isPaid) => {
  try {
    const response = await api.put(`/api/aliyot/payment/${paymentId}`, { isPaid });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בעדכון סטטוס התשלום' };
  }
};

// Make partial payment
export const makePartialPayment = async (paymentId, amount, note = '') => {
  try {
    const response = await api.post(`/api/aliyot/payment/${paymentId}/partial`, { amount, note });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה ברישום תשלום חלקי' };
  }
};

export const getUserAliyot = async (userId) => {
  try {
    const response = await api.get(`/api/aliyot/${userId}/aliyot`);
    return response?.data || []; 
  } catch (error) {
    console.error('Error fetching user aliyot:', error);
    return []; 
  }
};

// Get user details with debts (admin/gabai view)
export const getUserWithDebts = async (userId) => {
  try {
    const response = await api.get(`/api/aliyot/user/${userId}/details`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בקבלת פרטי משתמש וחובות' };
  }
};

// Update debt details
export const updateDebtDetails = async (debtId, debtData) => {
  try {
    const response = await api.put(`/api/aliyot/debt/${debtId}`, debtData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בעדכון פרטי החוב' };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/api/auth/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בקבלת רשימת משתמשים' };
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/api/auth/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בעדכון המשתמש' };
  }
};

export const createAliya = async (userId, aliyaData) => {
  try {
    if (!userId) {
      throw new Error('חסר מזהה משתמש');
    }

    // Ensure all required fields exist
    if (!aliyaData.amount || !aliyaData.parsha || !aliyaData.aliyaType) {
      throw new Error('חסרים שדות חובה: סכום, פרשה, או סוג עלייה');
    }

    // Format date properly
    const formattedDate = aliyaData.date instanceof Date 
      ? aliyaData.date.toISOString().split('T')[0] // Just get YYYY-MM-DD
      : typeof aliyaData.date === 'string' 
        ? aliyaData.date.split('T')[0] // Handle ISO string
        : new Date().toISOString().split('T')[0]; // Default to today

    // Create payload with all required fields including isPaid
    const payload = {
      userId,
      amount: Number(aliyaData.amount),
      parsha: aliyaData.parsha,
      aliyaType: aliyaData.aliyaType,
      date: formattedDate,
      isPaid: aliyaData.isPaid !== undefined ? aliyaData.isPaid : false // Add the missing required field
    };

    console.log('Sending aliya data:', payload);
    const response = await api.post('/api/aliyot/addAliyah', payload);
    return response.data;
  } catch (error) {
    console.error('Failed to create aliya:', error);
    
    // Provide a more specific error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error.message) {
      throw new Error(error.message);
    } else {
      throw new Error('אירעה שגיאה בהוספת העלייה');
    }
  }
};

// Get user profile
export const getUserProfile = async (userId) => {
  try {
    // Use the same endpoint as getUserDetails since that's likely the correct one
    const response = await api.get(`/api/auth/user/${userId}`);
    return response;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: 'אירעה שגיאה בקבלת פרטי הפרופיל' };
    }
  }
};

// Update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    // Update to use the same endpoint pattern as getUserProfile
    const response = await api.put(`/api/auth/user/${userId}`, profileData);
    return response;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: 'אירעה שגיאה בעדכון הפרופיל' };
    }
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/api/auth/users/${userId}`); // Updated path to match server route
    return response.data;
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw new Error('Failed to delete user');
  }
};

// Check authentication status
export const checkAuth = async () => {
  try {
    const response = await api.get('/api/auth/check-auth');
    return response.data;
  } catch (error) {
    console.error('Error checking auth:', error);
    return { isAuthenticated: false };
  }
};

// Helper function to log token information for debugging
export const debugToken = () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }
    
    // Parse the token (without verification)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    console.log('Token payload:', payload);
    
    // Check if token is expired
    const expiryDate = new Date(payload.exp * 1000);
    console.log('Token expires:', expiryDate);
    console.log('Is token expired:', expiryDate < new Date());
    
    return payload;
  } catch (error) {
    console.error('Error parsing token:', error);
    return null;
  }
};

export default api;
