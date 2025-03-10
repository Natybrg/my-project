import api from './api';

// קבלת כל התזכורות
export const getAllReminders = async () => {
  try {
    const response = await api.get('/reminders');
    return response.data;
  } catch (error) {
    console.error('Error fetching reminders:', error);
    throw error;
  }
};

// קבלת תזכורות לטווח תאריכים
export const getRemindersByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.get('/reminders/range', {
      params: {
        startDate,
        endDate
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching reminders by date range:', error);
    throw error;
  }
};

// הוספת תזכורת חדשה
export const addReminder = async (reminderData) => {
  try {
    const response = await api.post('/reminders', reminderData);
    return response.data;
  } catch (error) {
    console.error('Error adding reminder:', error);
    throw error;
  }
};

// עדכון תזכורת
export const updateReminder = async (id, reminderData) => {
  try {
    const response = await api.put(`/reminders/${id}`, reminderData);
    return response.data;
  } catch (error) {
    console.error('Error updating reminder:', error);
    throw error;
  }
};

// מחיקת תזכורת
export const deleteReminder = async (id) => {
  try {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting reminder:', error);
    throw error;
  }
};