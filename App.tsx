import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import './global.css';

const AppContent: React.FC = () => {
  const { user, token, isLoading, isDarkMode } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0066CC" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      {user && token ? <HomeScreen /> : <LoginScreen />}
      <StatusBar style={isDarkMode ? "light" : "dark"} />
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
