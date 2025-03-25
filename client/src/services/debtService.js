import axios from 'axios';

const API_URL = 'http://localhost:3002';

// Helper function to get auth headers
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('No token found when calling debt service');
    return {};
  }
  return { Authorization: `Bearer ${token}` };
};

// Get all debts for a user
export const getUserDebts = async (userId) => {
  try {
    const headers = getAuthHeader();
    const response = await axios.get(`${API_URL}/api/aliyot/${userId}/aliyot`, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching user debts:', error.response?.data || error.message);
    throw error;
  }
};

// Add a new debt/aliyah
export const addAliyah = async (debtData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/api/aliyot/addAliyah`, debtData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding aliyah:', error);
    throw error;
  }
};

// Update payment status (full payment)
export const updatePaymentStatus = async (paymentId, isPaid) => {
  try {
    const token = localStorage.getItem('token');
    
    // Try the aliyot endpoint first
    try {
      console.log(`Attempting to update payment status for ID ${paymentId} using aliyot endpoint`);
      const response = await axios.put(`${API_URL}/api/aliyot/payment/${paymentId}`, 
        { isPaid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Payment status updated successfully using aliyot endpoint');
      return response.data;
    } catch (aliyotError) {
      console.error('Error updating payment status using aliyot endpoint:', aliyotError);
      
      // If the first endpoint fails, try the api/debts endpoint
      console.log(`Attempting to update payment status for ID ${paymentId} using api/debts endpoint`);
      const response = await axios.put(`${API_URL}/api/debts/${paymentId}/pay`, 
        { isPaid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Payment status updated successfully using api/debts endpoint');
      return response.data;
    }
  } catch (error) {
    console.error('Error updating payment status (both endpoints failed):', error);
    throw error;
  }
};

// Make partial payment
export const makePartialPayment = async (paymentId, amount, note) => {
  try {
    const token = localStorage.getItem('token');
    
    // Try the aliyot endpoint first
    try {
      console.log(`Attempting to make partial payment for ID ${paymentId} using aliyot endpoint`);
      const response = await axios.post(`${API_URL}/api/aliyot/payment/${paymentId}/partial`, 
        { amount, note },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Partial payment recorded successfully using aliyot endpoint');
      return response.data;
    } catch (aliyotError) {
      console.error('Error making partial payment using aliyot endpoint:', aliyotError);
      
      // If the first endpoint fails, try the api/debts endpoint
      console.log(`Attempting to make partial payment for ID ${paymentId} using api/debts endpoint`);
      const response = await axios.post(`${API_URL}/api/debts/${paymentId}/partial-payment`, 
        { amount, note },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Partial payment recorded successfully using api/debts endpoint');
      return response.data;
    }
  } catch (error) {
    console.error('Error making partial payment (both endpoints failed):', error);
    throw error;
  }
};

// Update debt details
export const updateDebtDetails = async (debtId, debtData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/api/aliyot/debt/${debtId}`, 
      debtData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating debt details:', error);
    throw error;
  }
};

// Get user details with debts (admin/gabai view)
export const getUserDetailsWithDebts = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/api/aliyot/user/${userId}/details`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user details with debts:', error);
    throw error;
  }
};

// Delete a debt
export const deleteDebt = async (debtId) => {
  try {
    const token = localStorage.getItem('token');
    
    // Try the aliyot endpoint first
    try {
      console.log(`Attempting to delete debt with ID ${debtId} using aliyot endpoint`);
      const response = await axios.delete(`${API_URL}/api/aliyot/debt/${debtId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Debt deleted successfully using aliyot endpoint');
      return response.data;
    } catch (aliyotError) {
      console.error('Error deleting debt using aliyot endpoint:', aliyotError);
      
      // If the first endpoint fails, try the api/debts endpoint
      console.log(`Attempting to delete debt with ID ${debtId} using api/debts endpoint`);
      const response = await axios.delete(`${API_URL}/api/debts/${debtId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Debt deleted successfully using api/debts endpoint');
      return response.data;
    }
  } catch (error) {
    console.error('Error deleting debt (both endpoints failed):', error);
    throw error;
  }
};