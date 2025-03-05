import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3002',
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
// Update payment status to fully paid
export const updatePaymentStatus = async (paymentId, isPaid) => {
  try {
    const response = await api.put(`/aliyot/payment/${paymentId}`, { isPaid });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בעדכון התשלום' };
  }
};

// Add a new function for partial payments
export const makePartialPayment = async (paymentId, amount, note = '') => {
  try {
    const response = await api.post(`/aliyot/payment/${paymentId}/partial`, { amount, note });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בביצוע התשלום החלקי' };
  }
};

export const getUserAliyot = async (userId) => {
  try {
    const response = await api.get(`/aliyot/${userId}/aliyot`);
    return response?.data || []; 
  } catch (error) {
    console.error('Error fetching user aliyot:', error);
    return []; 
  }
};

// Get user details with debts (admin/gabai view)
export const getUserWithDebts = async (userId) => {
  try {
    const response = await api.get(`/aliyot/user/${userId}/details`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בקבלת פרטי משתמש וחובות' };
  }
};

// Update debt details
export const updateDebtDetails = async (debtId, debtData) => {
  try {
    const response = await api.put(`/aliyot/debt/${debtId}`, debtData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בעדכון פרטי החוב' };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await api.get('/auth/users');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בקבלת רשימת משתמשים' };
  }
};
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/auth/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'אירעה שגיאה בעדכון המשתמש' };
  }
};

export const createAliya = async (userId, aliyaData) => {
  try {
    const response = await api.post(`/aliyot/addAliyah`, {
      ...aliyaData,
      userId: userId,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
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