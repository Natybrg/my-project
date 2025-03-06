import React, { useEffect, useRef, useState } from 'react';

function JewishCalendar({ isSidePanelOpen, onCloseSidePanel }) {
  const calendarRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const handleCloseSidePanel = (isOpen) => {
    onCloseSidePanel(isOpen); 
  };
  useEffect(() => {
    const initCalendar = () => {
      const calendarEl = calendarRef.current;
      const newCalendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'title',
          right: 'prev,next today',
        },
        eventDisplay: 'block',
        events: {
          url: "https://www.hebcal.com/hebcal?cfg=fc&v=1&i=off&maj=on&min=on&nx=on&mf=on&ss=on&mod=on&lg=h&s=on",
          cache: true
        },
        height: '650px',
        contentHeight: '700px',
        aspectRatio: 1.5,
        direction: 'rtl',
        locale: 'he',
        buttonText: {
          today: 'היום'
        },
        dateClick: (info) => {
          setSelectedDate(info.dateStr);
          onCloseSidePanel(true);
        },
      });
      newCalendar.render();

      const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft' && !e.metaKey) {
          newCalendar.prev();
        } else if (e.key === 'ArrowRight' && !e.metaKey) {
          newCalendar.next();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    };

    const loadCalendarScript = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.9/index.global.min.js';
      script.integrity = 'sha384-wv6yRjQC0TqzEnAjFQVXM2V0JrF6Nk0dh6QAGf1RwzTqPArdwU3luBZjVCi2YSVH';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        // Load Hebrew locale after FullCalendar is loaded
        const localeScript = document.createElement('script');
        localeScript.src = 'https://cdn.jsdelivr.net/npm/@fullcalendar/core/locales/he.js';
        localeScript.onload = initCalendar;
        document.head.appendChild(localeScript);
      };
      document.head.appendChild(script);
    };

    if (typeof FullCalendar !== 'undefined') {
      initCalendar();
    } else {
      loadCalendarScript();
    }
  }, [onCloseSidePanel]);

  const renderHours = () => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(`${i < 10 ? '0' + i : i}:00`);
    }
    return hours.map((hour, index) => (
      <div key={index} style={{ padding: '5px', borderBottom: '1px solid #ddd' }}>
        {hour}
      </div>
    ));
  };

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      left: '10px',
      width: '800px',
      zIndex: 1000,
      display: 'flex',
      gap: '20px',
    }}>
      <div ref={calendarRef} id="calendar" style={{ flex: 2 }} />

      {isSidePanelOpen && (
        <div style={{
          flex: 1,
          border: '1px solid #ddd',
          padding: '10px',
          borderRadius: '5px',
          backgroundColor: '#f9f9f9',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
          transition: 'transform 0.3s ease-in-out',
          transform: 'translateX(0)',
        }}>
          <h3 style={{ textAlign: 'center', marginBottom: '10px' }}>
            שעות היום בתאריך: {selectedDate}
          </h3>
          <button
            onClick={() => handleCloseSidePanel(false)}
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
          {renderHours()}
        </div>
      )}
    </div>
  );
}

export default JewishCalendar;
