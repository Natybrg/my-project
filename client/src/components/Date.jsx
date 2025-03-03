import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

function HebcalCalendarSingleMonth() {
  const [hebcalData, setHebcalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('now');
  const [selectedDay, setSelectedDay] = useState(null); // יום נבחר
  const [dayEvents, setDayEvents] = useState([]); // אירועים ביום הנבחר

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=now&month=${selectedMonth}&ss=on&mf=on&c=on&geo=geoname&geonameid=3448439&M=on&s=on`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        setHebcalData(jsonData);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  useEffect(() => {
    if (hebcalData && selectedDay) {
      setDayEvents(hebcalData.items.filter(item => item.date.split('T')[0] === selectedDay));
    } else {
      setDayEvents([]);
    }
  }, [selectedDay, hebcalData]);

  if (loading) {
    return <div>טוען...</div>;
  }

  if (error) {
    return <div>שגיאה: {error.message}</div>;
  }

  if (!hebcalData) {
    return <div>אין נתונים זמינים.</div>;
  }

  const sortedItems = hebcalData.items.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  const days = {};
  sortedItems.forEach(item => {
    const date = item.date.split('T')[0];
    if (!days[date]) {
      days[date] = [];
    }
    days[date].push(item);
  });

  const fixedSize = 150;

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const dates = Object.keys(days);
  const firstDayOfWeek = new Date(dates[0]).getDay();

  const weeks = [];
  let currentWeek = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null);
  }

  dates.forEach(date => {
    currentWeek.push(date);
    if (new Date(date).getDay() === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleDayClick = (date) => {
    setSelectedDay(date);
  };

  return (
    <div dir="rtl">
      <FormControl style={{ margin: '16px' }}>
        <InputLabel id="month-select-label">בחר חודש</InputLabel>
        <Select
          labelId="month-select-label"
          id="month-select"
          value={selectedMonth}
          onChange={handleMonthChange}
        >
          <MenuItem value="now">החודש הנוכחי</MenuItem>
          <MenuItem value="1">ינואר</MenuItem>
          <MenuItem value="2">פברואר</MenuItem>
          <MenuItem value="3">מרץ</MenuItem>
          <MenuItem value="4">אפריל</MenuItem>
          <MenuItem value="5">מאי</MenuItem>
          <MenuItem value="6">יוני</MenuItem>
          <MenuItem value="7">יולי</MenuItem>
          <MenuItem value="8">אוגוסט</MenuItem>
          <MenuItem value="9">ספטמבר</MenuItem>
          <MenuItem value="10">אוקטובר</MenuItem>
          <MenuItem value="11">נובמבר</MenuItem>
          <MenuItem value="12">דצמבר</MenuItem>
        </Select>
      </FormControl>
      <Grid container spacing={1}>
        {daysOfWeek.map((day, index) => (
          <Grid item xs={12 / 7} key={index}>
            <Paper elevation={1} style={{ padding: '8px', textAlign: 'center' }}>
              <Typography variant="subtitle2">{day}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={1} style={{ marginTop: '8px' }}>
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((date, dayIndex) => (
              <Grid item xs={12 / 7} key={dayIndex}>
                {date ? (
                  <Paper
                    elevation={3}
                    style={{
                      width: fixedSize,
                      height: fixedSize,
                      padding: '8px',
                      overflow: 'auto',
                      cursor: 'pointer', // סמן עכבר
                    }}
                    onClick={() => handleDayClick(date)} // טיפול בלחיצה
                  >
                    <Typography variant="subtitle2">
                      {new Date(date).getDate()} {new Date(date).toLocaleDateString('he-IL', { month: 'short' })}
                    </Typography>
                    {days[date].map((item, index) => (
                      <div key={index}>
                        {item.title && <Typography variant="body2">{item.title}</Typography>}
                        {item.candles && <Typography variant="body2">{item.candles}</Typography>}
                        {item.havdalah && <Typography variant="body2">{item.havdalah}</Typography>}
                        {item.dafyomi && <Typography variant="body2">{item.dafyomi.english}</Typography>}
                      </div>
                    ))}
                  </Paper>
                ) : (
                  <Paper style={{ width: fixedSize, height: fixedSize }} />
                )}
              </Grid>
            ))}
          </React.Fragment>
        ))}
      </Grid>
      {selectedDay && (
        <Paper style={{ marginTop: '16px', padding: '16px' }}>
          <Typography variant="h6">אירועים ב- {new Date(selectedDay).toLocaleDateString('he-IL')}</Typography>
          {dayEvents.map((event, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              {event.title && <Typography variant="body1">{event.title}</Typography>}
              {event.candles && <Typography variant="body2">הדלקת נרות: {event.candles}</Typography>}
              {event.havdalah && <Typography variant="body2">הבדלה: {event.havdalah}</Typography>}
              {event.dafyomi && <Typography variant="body2">דף יומי: {event.dafyomi.english}</Typography>}
            </div>
          ))}
        </Paper>
      )}
    </div>
  );
}

export default HebcalCalendarSingleMonth;