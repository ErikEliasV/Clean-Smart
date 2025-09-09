import React from 'react';
import { View, Text } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../contexts/AuthContext';

const ResponsiveDemo: React.FC = () => {
  const { isTablet, isLandscape, screenWidth, screenHeight, shouldUseSidebar } = useResponsive();
  const { isDarkMode } = useAuth();

  return (
    <View className={`p-4 m-4 rounded-xl ${
      isDarkMode ? 'bg-gray-800' : 'bg-blue-50'
    }`}>
      <Text className={`text-lg font-bold mb-2 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        Informações de Responsividade
      </Text>
      
      <View className="space-y-1">
        <Text className={`text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Largura: {screenWidth}px
        </Text>
        <Text className={`text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Altura: {screenHeight}px
        </Text>
        <Text className={`text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          É Tablet: {isTablet ? 'Sim' : 'Não'}
        </Text>
        <Text className={`text-sm ${
          isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Modo Paisagem: {isLandscape ? 'Sim' : 'Não'}
        </Text>
        <Text className={`text-sm font-medium ${
          shouldUseSidebar ? 'text-green-600' : 'text-orange-600'
        }`}>
          Usando Barra Lateral: {shouldUseSidebar ? 'Sim' : 'Não'}
        </Text>
      </View>
    </View>
  );
};

export default ResponsiveDemo;
