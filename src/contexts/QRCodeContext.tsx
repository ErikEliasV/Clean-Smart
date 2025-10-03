import React, { createContext, useContext, useState, ReactNode } from 'react';

interface QRCodeContextType {
  qrCodeData: string | null;
  setQRCodeData: (data: string | null) => void;
  clearQRCodeData: () => void;
}

const QRCodeContext = createContext<QRCodeContextType | undefined>(undefined);

export const useQRCode = () => {
  const context = useContext(QRCodeContext);
  if (context === undefined) {
    throw new Error('useQRCode must be used within a QRCodeProvider');
  }
  return context;
};

interface QRCodeProviderProps {
  children: ReactNode;
}

export const QRCodeProvider: React.FC<QRCodeProviderProps> = ({ children }) => {
  const [qrCodeData, setQRCodeData] = useState<string | null>(null);

  const clearQRCodeData = () => {
    setQRCodeData(null);
  };

  return (
    <QRCodeContext.Provider value={{ qrCodeData, setQRCodeData, clearQRCodeData }}>
      {children}
    </QRCodeContext.Provider>
  );
};

