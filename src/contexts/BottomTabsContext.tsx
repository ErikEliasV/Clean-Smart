import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BottomTabsContextType {
  hideBottomTabs: boolean;
  setHideBottomTabs: (hide: boolean) => void;
}

const BottomTabsContext = createContext<BottomTabsContextType | undefined>(undefined);

export const BottomTabsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hideBottomTabs, setHideBottomTabs] = useState(false);

  return (
    <BottomTabsContext.Provider value={{ hideBottomTabs, setHideBottomTabs }}>
      {children}
    </BottomTabsContext.Provider>
  );
};

export const useBottomTabs = () => {
  const context = useContext(BottomTabsContext);
  if (context === undefined) {
    throw new Error('useBottomTabs must be used within a BottomTabsProvider');
  }
  return context;
};
