import React from 'react';
import { 
  Typography, 
  Paper, 
  Box, 
  Divider, 
  CircularProgress 
} from '@mui/material';
import { AccessTime, Schedule } from '@mui/icons-material';

const DayTimes = ({ selectedDay, dayTimes, hebrewDate }) => {
  // סידור הזמנים בסדר המבוקש
  const orderedTimes = () => {
    if (!dayTimes) return [];
    
    const order = [
      'עלות השחר',
      'משיכיר',
      'נץ החמה',
      'סוף זמן קריאת שמע',
      'סוף זמן תפילה',
      'חצות היום',
      'מנחה גדולה',
      'שקיעה',
      'צאת הכוכבים'
    ];
    
    // מסנן ומסדר את הזמנים לפי הסדר המבוקש
    return Object.entries(dayTimes)
      .sort((a, b) => {
        const indexA = order.indexOf(a[0]);
        const indexB = order.indexOf(b[0]);
        // אם הערך לא נמצא ברשימה, שים אותו בסוף
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
  };

  return (
    <Paper elevation={3} sx={{ p: 2 }} dir="rtl">
      <Typography variant="h6" component="div" sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AccessTime sx={{ ml: 1 }} />
        זמני היום {selectedDay && hebrewDate ? `- ${hebrewDate}` : ''}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      {!dayTimes ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Box>
          {orderedTimes().map(([label, time]) => (
            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 0, ml: 1, fontSize: 18, color: 'primary.main' }} />
                <Typography variant="body1" fontWeight={label === 'הדלקת נרות' || label === 'הבדלה' ? 'bold' : 'normal'}>
                  {label}
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="bold">
                {time || 'N/A'}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default DayTimes;