import React, { useState, useEffect } from 'react';

function DayTimesDisplay() {
  const [dayTimes, setDayTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getAllDayTimes() {
      const allDayTimes = [];
      const currentYear = new Date().getFullYear();

      for (let month = 1; month <= 12; month++) {
        const apiUrl = `https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&mod=on&nx=on&year=${currentYear}&month=${month}&ss=on&mf=on&c=on&geo=geoname&geonameid=3448439&M=on&s=on`;

        try {
          const response = await fetch(apiUrl);
          const data = await response.json();

          if (data && data.items) {
            data.items.forEach((item) => {
              if (item.category === 'zmanim') {
                allDayTimes.push({
                  date: item.date,
                  title: item.title,
                  hebrew: item.hebrew,
                  memo: item.memo,
                });
              }
            });
          }
        } catch (err) {
          setError(err);
          console.error(`Error fetching data for month ${month}:`, err);
        }
      }

      return allDayTimes;
    }

    setLoading(true);
    getAllDayTimes()
      .then((times) => {
        setDayTimes(times);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message || 'Failed to load data'}</div>;
  }

  return (
    <div>
      <h2>Day Times</h2>
      <ul>
        {dayTimes.map((dayTime, index) => (
          <li key={index}>
            <strong>Date:</strong> {dayTime.date}, <strong>Title:</strong> {dayTime.title}, <strong>Hebrew:</strong>{' '}
            {dayTime.hebrew}, <strong>Memo:</strong> {dayTime.memo}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DayTimesDisplay;