import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { SalasProvider } from './src/contexts/SalasContext';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SalasProvider>
          <StatusBar 
            style="light" 
            backgroundColor="transparent" 
            translucent={true}
            hidden={false}
          />
          <AppNavigator />
        </SalasProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
