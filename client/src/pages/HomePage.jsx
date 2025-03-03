import Datafor from "../components/Datefor.jsx";
import React, { useState } from "react";
import Data from "../components/Date.jsx";
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
