import axios from 'axios';
import { formatDateKey, formatTime } from './utils';

// פונקציה לקריאה ל-API של Hebcal לקבלת תאריכים עבריים וחגים
export const fetchHebrewDates = async (dates) => {
  try {
    const hebrewDates = {};
    const holidays = {};
    
    for (const date of dates) {
      // שימוש בתאריך מקומי ללא שינוי אזור זמן
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth מחזיר 0-11
      const day = date.getDate();
      const dateKey = formatDateKey(date);
      
      const response = await axios.get(`https://www.hebcal.com/converter`, {
        params: {
          cfg: 'json',
          gy: year,
          gm: month,
          gd: day,
          g2h: 1,
        },
      });
      
      if (response.data && response.data.hebrew) {
        // שמירת התאריך העברי בפורמט נקי יותר
        hebrewDates[dateKey] = response.data.hebrew.replace(/[\u0591-\u05C7]/g, '');
        
        // בדיקה אם יש חג
        if (response.data.events && response.data.events.length > 0) {
          // ניקוי שמות החגים מטעמי ניקוד
          holidays[dateKey] = response.data.events[0].replace(/[\u0591-\u05C7]/g, '');
        }
      } else {
        // שמירת לוג אזהרה במקרה שלא נמצא תאריך עברי
        console.warn(`No Hebrew date found for ${dateKey}`);
        hebrewDates[dateKey] = '';
      }
    }
    
    return { hebrewDates, holidays };
  } catch (error) {
    console.error('Error fetching Hebrew dates:', error);
    throw error;
  }
};

// פונקציה לקבלת זמני היום מ-API
export const fetchDayTimes = async (date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const response = await axios.get(`https://www.hebcal.com/zmanim`, {
      params: {
        cfg: 'json',
        latitude: 31.7683, // Latitude for Jerusalem
        longitude: 35.2137, // Longitude for Jerusalem
        date: formattedDate,
      },
    });

    if (response.data && response.data.times) {
      const rawTimes = response.data.times;

      // Filter only the required times
      const timeLabels = {
        alotHaShachar: 'עלות השחר',
        misheyakir: 'משיכיר',
        sunrise: 'נץ החמה',
        sofZmanShma: 'סוף זמן קריאת שמע',
        minchaGedola: 'מנחה גדולה',
        sofZmanTfilla: 'סוף זמן תפילה',
        chatzot: 'חצות היום',
        sunset: 'שקיעה',
        tzeit7083deg: 'צאת הכוכבים',
      };

      const formattedTimes = Object.entries(rawTimes).reduce((acc, [key, value]) => {
        if (timeLabels[key]) {
          acc[timeLabels[key]] = formatTime(value); // Format the time
        }
        return acc;
      }, {});

      // Add Candle Lighting and Havdalah times at the top of the list
      const specialTimes = {};
      if (rawTimes.candle_lighting) {
        specialTimes['הדלקת נרות'] = formatTime(rawTimes.candle_lighting);
      }
      if (rawTimes.havdalah) {
        specialTimes['הבדלה'] = formatTime(rawTimes.havdalah);
      }

      // Merge special times at the top of the list
      return { ...specialTimes, ...formattedTimes };
    } else {
      console.warn(`No times found for ${formattedDate}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching day times:', error);
    throw error;
  }
};