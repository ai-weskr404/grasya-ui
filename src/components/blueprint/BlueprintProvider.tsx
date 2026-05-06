import React, { useEffect } from "react";
import { FocusStyleManager } from "@blueprintjs/core";

interface BlueprintProviderProps {
  children?: React.ReactNode;
}

export const BlueprintProvider: React.FC<BlueprintProviderProps> = ({ children }) => {
  useEffect(() => {
    try {
      FocusStyleManager.onlyShowFocusOnTabs();
    } catch (e) {
      // defensive: FocusStyleManager may be unavailable in some test harnesses
    }
  }, []);

  return <div className="bp-root">{children}</div>;
};

export default BlueprintProvider;
