import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';


import LoginScreen from '../screens/LoginScreen';
import InformationScreen from '../screens/InformationScreen';
import SalasScreen from '../screens/SalasScreen';
import RegistrosLimpezaScreen from '../screens/RegistrosLimpezaScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserManagementScreen from '../screens/UserManagementScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';


import { Home, User, Users, Settings, Building } from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';

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
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="UserManagement" component={UserManagementScreen} />
    </Stack.Navigator>
  );
};

const SalasStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SalasMain" component={SalasScreen} />
      <Stack.Screen name="RegistrosLimpeza" component={RegistrosLimpezaScreen} />
    </Stack.Navigator>
  );
};


const TabNavigator = () => {
  const { isDarkMode } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let IconComponent;

          if (route.name === 'Home') {
            IconComponent = Home;
          } else if (route.name === 'Salas') {
            IconComponent = Building;
          } else if (route.name === 'Profile') {
            IconComponent = User;
          } else {
            IconComponent = User;
          }

          return <IconComponent size={size} color={color} />;
        },
        tabBarActiveTintColor: SENAC_COLORS.primary,
        tabBarInactiveTintColor: isDarkMode ? SENAC_COLORS.dark.disabled : SENAC_COLORS.light.disabled,
        tabBarStyle: {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          borderTopColor: isDarkMode ? '#374151' : '#E5E7EB',
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
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Salas" 
        component={SalasStack}
        options={{
          tabBarLabel: 'Salas',
        }}
      />
      <Tab.Screen 
        name="Home" 
        component={InformationScreen}
        options={{
          tabBarLabel: 'Informações',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
    </Tab.Navigator>
  );
};


const AppNavigator = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <TabNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
};

export default AppNavigator;
