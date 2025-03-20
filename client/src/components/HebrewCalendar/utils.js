// פונקציה ליצירת מפתח תאריך עבור השוואה וכדומה
export const formatDateKey = (date) => {
  if (!date) return '';
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
};

// פונקציה לקבלת היום הראשון בשבוע (יום ראשון)
export const getStartOfWeek = (date) => {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  return result;
};

// פונקציה להמרת מספר היום לשם היום בעברית
export const getHebrewDayName = (dayNum) => {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  return days[dayNum];
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

// פונקציה לקבלת שם החודש בעברית
export const getHebrewMonthName = (month) => {
  const hebrewMonths = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];
  return hebrewMonths[month];
};

// פונקציה לפורמט תאריך בעברית (יום בשבוע, יום בחודש, חודש)
export const formatDateInHebrew = (date) => {
  if (!date) return '';
  const day = date.getDate();
  const month = date.getMonth();
  return `${day} ב${getHebrewMonthName(month)}`;
};