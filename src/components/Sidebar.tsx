import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Home, User, Building, ChevronLeft, ChevronRight, Settings, QrCode } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { SENAC_COLORS } from '../constants/colors';

interface SidebarProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabPress, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const { isDarkMode } = useAuth();
  const [animatedWidth] = useState(new Animated.Value(isCollapsed ? 80 : 250));

  React.useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: isCollapsed ? 80 : 250,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isCollapsed, animatedWidth]);

  const tabs = [
    { name: 'Home', icon: Home, label: 'Informações' },
    { name: 'Salas', icon: Building, label: 'Salas' },
    { name: 'QRScanner', icon: QrCode, label: 'QR Scanner' },
    { name: 'Profile', icon: User, label: 'Perfil' },
    { name: 'Settings', icon: Settings, label: 'Configurações' },
  ];

  const getIconColor = (tabName: string) => {
    return activeTab === tabName 
      ? SENAC_COLORS.primary 
      : (isDarkMode ? SENAC_COLORS.dark.disabled : SENAC_COLORS.light.disabled);
  };

  return (
    <Animated.View 
      style={{
        width: animatedWidth,
        height: '100%',
        backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
        borderRightWidth: 1,
        borderRightColor: isDarkMode ? '#374151' : '#E5E7EB',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      }}
    >
      {/* Header com botão de toggle */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <Text className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Zela Senac
          </Text>
        )}
        <TouchableOpacity
          onPress={onToggleCollapse}
          className="p-2 rounded-full"
          style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
        >
          {isCollapsed ? (
            <ChevronRight size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          ) : (
            <ChevronLeft size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          )}
        </TouchableOpacity>
      </View>

      {/* Navegação */}
      <View className="flex-1 pt-4">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.name;
          const isQRScanner = tab.name === 'QRScanner';
          
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => onTabPress(tab.name)}
              className={`flex-row items-center p-4 mx-2 rounded-xl mb-2 ${
                isActive 
                  ? (isDarkMode ? 'bg-gray-700' : 'bg-blue-50') 
                  : ''
              }`}
              style={{
                backgroundColor: isActive 
                  ? (isDarkMode ? '#374151' : '#EFF6FF') 
                  : 'transparent',
                ...(isQRScanner && {
                  backgroundColor: isActive 
                    ? SENAC_COLORS.primary 
                    : (isDarkMode ? '#374151' : '#F3F4F6'),
                  borderWidth: 1,
                  borderColor: SENAC_COLORS.primary,
                })
              }}
            >
              <View style={{
                width: 24,
                height: 24,
                alignItems: 'center',
                justifyContent: 'center',
                ...(isQRScanner && isActive && {
                  backgroundColor: 'white',
                  borderRadius: 4,
                })
              }}>
                <IconComponent 
                  size={24} 
                  color={isQRScanner && isActive ? SENAC_COLORS.primary : getIconColor(tab.name)} 
                />
              </View>
              {!isCollapsed && (
                <Text className={`ml-3 text-base font-medium ${
                  isActive 
                    ? (isQRScanner ? 'text-white' : (isDarkMode ? 'text-white' : 'text-blue-600'))
                    : (isDarkMode ? 'text-gray-300' : 'text-gray-600')
                }`}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

export default Sidebar;
