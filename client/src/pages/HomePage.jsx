import Datafor from "../components/Datefor.jsx";
import React, { useState } from "react";
const HomePage = () => {
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    const handleCloseSidePanel = (isOpen) => {
      setIsSidePanelOpen(isOpen);
    };
  return (
    <div>
      <Datafor 
        isSidePanelOpen={isSidePanelOpen} onCloseSidePanel={handleCloseSidePanel}/>
    </div>
  );
};

export default HomePage;
