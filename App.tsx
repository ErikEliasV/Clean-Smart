import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/contexts/AuthContext';
import { SalasProvider } from './src/contexts/SalasContext';
import { QRCodeProvider } from './src/contexts/QRCodeContext';
import { BottomTabsProvider } from './src/contexts/BottomTabsContext';
import { NotificationsProvider } from './src/contexts/NotificationsContext';
import { GroupsProvider } from './src/contexts/GroupsContext';
import { LimpezaProvider } from './src/contexts/LimpezaContext';
import AppNavigator from './src/navigation/AppNavigator';
import './global.css';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SalasProvider>
          <LimpezaProvider>
            <QRCodeProvider>
              <BottomTabsProvider>
                <NotificationsProvider>
                  <GroupsProvider>
                    <StatusBar 
                      style="light" 
                      backgroundColor="transparent" 
                      translucent={true}
                      hidden={false}
                    />
                    <AppNavigator />
                  </GroupsProvider>
                </NotificationsProvider>
              </BottomTabsProvider>
            </QRCodeProvider>
          </LimpezaProvider>
        </SalasProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
