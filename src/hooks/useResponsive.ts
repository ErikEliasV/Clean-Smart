import { useState, useEffect } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ResponsiveState {
  isTablet: boolean;
  isLandscape: boolean;
  screenWidth: number;
  screenHeight: number;
  shouldUseSidebar: boolean;
}

export const useResponsive = (): ResponsiveState => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isLandscape = width > height;
  const isTablet = Math.min(width, height) >= 768;
  // Usar sidebar em tablets em landscape ou em tablets grandes em portrait
  const shouldUseSidebar = isTablet && (isLandscape || Math.min(width, height) >= 1024);

  return {
    isTablet,
    isLandscape,
    screenWidth: width,
    screenHeight: height,
    shouldUseSidebar,
  };
};
