import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

// Get all debts for a user
export const getUserDebts = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/aliyot/${userId}/aliyot`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user debts:', error);
    throw error;
  }
};

// Add a new debt/aliyah
export const addAliyah = async (debtData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/aliyot/addAliyah`, debtData, {
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
    const response = await axios.put(`${API_URL}/aliyot/payment/${paymentId}`, 
      { isPaid },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

// Make partial payment
export const makePartialPayment = async (paymentId, amount, note) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/aliyot/payment/${paymentId}/partial`, 
      { amount, note },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error making partial payment:', error);
    throw error;
  }
};

// Update debt details
export const updateDebtDetails = async (debtId, debtData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/aliyot/debt/${debtId}`, 
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
    const response = await axios.get(`${API_URL}/aliyot/user/${userId}/details`, {
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
    const response = await fetch(`${API_URL}/aliyot/debt/${debtId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete debt');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting debt:', error);
    throw error;
  }
};