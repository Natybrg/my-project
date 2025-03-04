import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3001',
});

export const login = async (phone, password) => {
  try {
    const response = await api.post('/auth/login', { phone, password });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// פונקציה חדשה לקבלת פרטי המשתמש
export const getUserDetails = async (userId) => {
  try {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בקבלת פרטי המשתמש' };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw { message: 'אירעה שגיאה בהתחברות לשרת' };
    }
  }
};
// Add this function to your api.js file
export const updatePaymentStatus = async (paymentId, isPaid) => {
  try {
    const response = await api.put(`/aliyot/payment/${paymentId}`, { isPaid });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בעדכון התשלום' };
  }
};
export const getUserAliyot = async (userId) => {
  try {
    const response = await api.get(`/aliyot/${userId}/aliyot`);
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};

// Request interceptor - הוספת טוקן לכל בקשה
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - טיפול בשגיאות אימות
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

export default api;