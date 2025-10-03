import React, { useState } from 'react';
import { View, Modal, Alert, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useAuth } from '../contexts/AuthContext';
import { useQRCode } from '../contexts/QRCodeContext';
import { useBottomTabs } from '../contexts/BottomTabsContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useGroups } from '../contexts/GroupsContext';
import { useResponsive } from '../hooks/useResponsive';
import Sidebar from '../components/Sidebar';

import LoginScreen from '../screens/LoginScreen';
import InformationScreen from '../screens/InformationScreen';
import SalasScreen from '../screens/SalasScreen';
import RegistrosLimpezaScreen from '../screens/RegistrosLimpezaScreen';
import LimpezaProcessoScreen from '../screens/LimpezaProcessoScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import SettingsScreen from '../screens/SettingsScreen';

import { Home, User, Users, Settings, Building, QrCode, X } from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';
import { SalasStackParamList } from '../types/navigation';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
};

const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
    </Stack.Navigator>
  );
};

const SalasStack = () => {
  const SalasStackNavigator = createStackNavigator<SalasStackParamList>();
  
  return (
    <SalasStackNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SalasStackNavigator.Screen name="SalasMain" component={SalasScreen} />
      <SalasStackNavigator.Screen name="RegistrosLimpeza" component={RegistrosLimpezaScreen} />
      <SalasStackNavigator.Screen name="LimpezaProcesso" component={LimpezaProcessoScreen} />
    </SalasStackNavigator.Navigator>
  );
};

interface TabNavigatorProps {
}

const TabNavigator: React.FC<TabNavigatorProps> = () => {
  const { isDarkMode } = useAuth();
  const { setQRCodeData } = useQRCode();
  const { hideBottomTabs } = useBottomTabs();
  const { notificacoesNaoLidas, carregarNotificacoes } = useNotifications();
  const { carregarGrupos } = useGroups();
  const insets = useSafeAreaInsets();
  const { shouldUseSidebar } = useResponsive();
  const [activeTab, setActiveTab] = useState('Home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  React.useEffect(() => {
    carregarNotificacoes();
    carregarGrupos();
  }, [carregarNotificacoes, carregarGrupos]);

  const handleTabPress = (tabName: string) => {
    if (tabName === 'QRScanner') {
      handleOpenScanner();
    } else {
      setActiveTab(tabName);
    }
  };

  const handleOpenScanner = () => {
    if (!permission) {
      Alert.alert('Permissão necessária', 'Aguarde enquanto solicitamos permissão para a câmera.');
      return;
    }
    
    if (!permission.granted) {
      Alert.alert(
        'Permissão negada',
        'É necessário permitir o acesso à câmera para usar o scanner de QR code.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Configurações', onPress: () => requestPermission() }
        ]
      );
      return;
    }
    
    setShowScanner(true);
  };

  const handleQRCodeScanned = ({ data }: { data: string }) => {
    setShowScanner(false);
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(data)) {
      Alert.alert(
        'QR Code Inválido',
        'Este QR Code não é válido para o sistema de limpeza.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setQRCodeData(data);
    setActiveTab('Salas');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Home':
        return <InformationScreen />;
      case 'Salas':
        return <SalasStack />;
      case 'Profile':
        return <ProfileStack />;
      case 'Settings':
        return <SettingsStack />;
      case 'QRScanner':
        return <InformationScreen />; // Fallback para quando não está escaneando
      default:
        return <InformationScreen />;
    }
  };

  if (shouldUseSidebar) {
    return (
      <>
        <View className="flex-1 flex-row">
          <Sidebar
            activeTab={activeTab}
            onTabPress={handleTabPress}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
          <View className="flex-1">
            {renderContent()}
          </View>
        </View>

        <Modal
          visible={showScanner}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowScanner(false)}
        >
          <View className="flex-1 bg-black">
            <View className="flex-1 justify-center items-center">
              {!permission ? (
                <View className="items-center">
                  <Text className="text-white text-lg mb-4">Solicitando permissão da câmera...</Text>
                </View>
              ) : !permission.granted ? (
                <View className="items-center">
                  <Text className="text-white text-lg mb-4">Permissão da câmera negada</Text>
                  <TouchableOpacity
                    onPress={() => setShowScanner(false)}
                    className="px-6 py-3 rounded-xl"
                    style={{ backgroundColor: SENAC_COLORS.primary }}
                  >
                    <Text className="text-white font-semibold">Voltar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="flex-1 w-full">
                  <CameraView
                    style={{ flex: 1 }}
                    onBarcodeScanned={handleQRCodeScanned}
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                  />
                  <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
                    <TouchableOpacity
                      onPress={() => setShowScanner(false)}
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                    >
                      <X size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-semibold">
                      Escaneie o QR Code
                    </Text>
                    <View className="w-10" />
                  </View>
                  <View className="absolute top-1/2 left-0 right-0 items-center" style={{ marginTop: -100 }}>
                    <View className="w-64 h-64 border-2 border-white rounded-lg opacity-50" />
                    <Text className="text-white text-center mt-4 px-8">
                      Posicione o código QR dentro da moldura
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <>
      <Tab.Navigator
        initialRouteName="Salas"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let IconComponent;

            if (route.name === 'Home') {
              IconComponent = Home;
            } else if (route.name === 'Salas') {
              IconComponent = Building;
            } else if (route.name === 'QRScanner') {
              IconComponent = QrCode;
            } else if (route.name === 'Profile') {
              IconComponent = User;
            } else if (route.name === 'Settings') {
              IconComponent = Settings;
            } else {
              IconComponent = User;
            }

            if (route.name === 'QRScanner') {
              return (
                <View className="w-20 h-20 rounded-full items-center justify-center -mt-8"
                      style={{ 
                        backgroundColor: SENAC_COLORS.primary,
                        shadowColor: SENAC_COLORS.primary,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 12,
                      }}>
                  <QrCode size={32} color="white" />
                </View>
              );
            }

            if (route.name === 'Profile' && notificacoesNaoLidas > 0) {
              return (
                <View className="relative">
                  <IconComponent size={size} color={color} />
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[16px] h-4 items-center justify-center">
                    <Text className="text-white text-xs font-bold">
                      {notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas}
                    </Text>
                  </View>
                </View>
              );
            }

            return <IconComponent size={size} color={color} />;
          },
          tabBarActiveTintColor: SENAC_COLORS.primary,
          tabBarInactiveTintColor: isDarkMode ? SENAC_COLORS.dark.disabled : SENAC_COLORS.light.disabled,
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
            borderTopColor: isDarkMode ? '#1F2937' : '#E5E7EB',
            borderTopWidth: 1,
            paddingBottom: Math.max(insets.bottom, 8),
            paddingTop: 8,
            height: 60 + Math.max(insets.bottom, 8),
            paddingHorizontal: 16,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            display: (shouldUseSidebar || hideBottomTabs) ? 'none' : 'flex',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        })}
      >
        <Tab.Screen 
          name="Home" 
          component={InformationScreen}
          options={{
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen 
          name="Salas" 
          component={SalasStack}
          options={{
            tabBarLabel: 'Salas',
          }}
        />
        <Tab.Screen 
          name="QRScanner" 
          component={View}
          options={{
            tabBarLabel: '',
            tabBarButton: (props) => (
              <TouchableOpacity
                onPress={() => handleTabPress('QRScanner')}
                className="flex-1 items-center justify-center"
              >
                {props.children}
              </TouchableOpacity>
            ),
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileStack}
          options={{
            tabBarLabel: 'Perfil',
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsStack}
          options={{
            tabBarLabel: 'Config',
          }}
        />
      </Tab.Navigator>

      <Modal
        visible={showScanner}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowScanner(false)}
      >
        <View className="flex-1 bg-black">
          <View className="flex-1 justify-center items-center">
            {!permission ? (
              <View className="items-center">
                <Text className="text-white text-lg mb-4">Solicitando permissão da câmera...</Text>
              </View>
            ) : !permission.granted ? (
              <View className="items-center">
                <Text className="text-white text-lg mb-4">Permissão da câmera negada</Text>
                <TouchableOpacity
                  onPress={() => setShowScanner(false)}
                  className="px-6 py-3 rounded-xl"
                  style={{ backgroundColor: SENAC_COLORS.primary }}
                >
                  <Text className="text-white font-semibold">Voltar</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-1 w-full">
                <CameraView
                  style={{ flex: 1 }}
                  onBarcodeScanned={handleQRCodeScanned}
                  barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                  }}
                />
                <View className="absolute top-12 left-4 right-4 flex-row justify-between items-center">
                  <TouchableOpacity
                    onPress={() => setShowScanner(false)}
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                  >
                    <X size={24} color="white" />
                  </TouchableOpacity>
                  <Text className="text-white text-lg font-semibold">
                    Escaneie o QR Code
                  </Text>
                  <View className="w-10" />
                </View>
                <View className="absolute top-1/2 left-0 right-0 items-center" style={{ marginTop: -100 }}>
                  <View className="w-64 h-64 border-2 border-white rounded-lg opacity-50" />
                  <Text className="text-white text-center mt-4 px-8">
                    Posicione o código QR dentro da moldura
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

    </>
  );
};

const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <>
      <NavigationContainer>
        {user ? (
          <TabNavigator />
        ) : (
          <LoginScreen />
        )}
      </NavigationContainer>
      
    </>
  );
};

export default AppNavigator;
