// פונקציה לפורמט מפתח תאריך
export const formatDateKey = (date) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.error('Invalid date object passed to formatDateKey:', date);
    return '';
  }
  
  // שימוש בתאריך מקומי במקום UTC כדי למנוע בעיות עם אזורי זמן
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const result = `${year}-${month}-${day}`;
  return result;
};

// פונקציה להמרת מספר היום לשם היום בעברית
export const getHebrewDayName = (dayNum) => {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return days[dayNum];
};

// פונקציה לחישוב תחילת השבוע (יום ראשון)
export const getStartOfWeek = (date) => {
  const result = new Date(date);
  // קביעת השעה ל-0 לפני חישוב היום בשבוע
  result.setHours(0, 0, 0, 0);
  
  const day = result.getDay();
  
  // חישוב ההפרש בימים מיום ראשון
  const diff = result.getDate() - day;
  result.setDate(diff);
  
  // מכיוון שאנחנו מציגים את הימים מימין לשמאל (ראשון עד שבת)
  // ואנחנו הופכים את הסדר בקוד אחר, אנחנו משאירים את הלוגיקה הבסיסית של
  // מציאת יום ראשון כתחילת השבוע
  
  return result;
};

// פונקציה לפורמט שעה מספרית (מ-API)
export const formatNumericTime = (timeStr) => {
  if (!timeStr) return '';
  
  // אם השעה כבר בפורמט הנכון, החזר אותה כמו שהיא
  if (timeStr.includes(':')) return timeStr;
  
  // המרת פורמט שעה מ-API
  const hours = Math.floor(timeStr);
  const minutes = Math.round((timeStr - hours) * 60);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// פונקציה לפורמט תאריך גרגוריאני
export const formatGregorianDate = (date) => {
  return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'numeric', year: 'numeric' });
};

// פונקציה לפורמט שעה מתאריך
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

// פונקציה לפורמט התאריך העברי
export const formatHebrewDate = (hebrewDate) => {
  if (!hebrewDate || typeof hebrewDate !== 'object') return '';
  
  // אם זה כבר מחרוזת
  if (typeof hebrewDate === 'string') {
    return hebrewDate.split(' ').slice(0, 2).join(' ');
  }
  
  // אם יש מבנה מסוים עם שדות
  if (hebrewDate.date) {
    return hebrewDate.date.split(' ').slice(0, 2).join(' ');
  }
  
  return '';
};