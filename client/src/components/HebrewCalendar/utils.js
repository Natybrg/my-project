// פונקציה לפורמט מפתח תאריך
export const formatDateKey = (date) => {
  return date.toISOString().split('T')[0];
};

export const getHebrewDayName = (dayIndex) => {
  const hebrewDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return hebrewDays[dayIndex];
};

export const formatGregorianDate = (date) => {
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

export const formatTime = (timeString) => {
  if (!timeString) return 'N/A';
  try {
    const date = new Date(timeString);
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};