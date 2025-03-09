import React, { useState } from "react";
import HebrewCalendar from "../components/HebrewCalendar"; // עדכון הייבוא לרכיב החדש

const HomePage = () => {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    const handleCloseSidePanel = (isOpen) => {
      setIsSidePanelOpen(isOpen);
    };

  return (
    <div>
      <HebrewCalendar /> {/* החלפת הרכיב */}
    </div>
  );
};

export default HomePage;
