import React from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen: React.FC = () => {
  const { user, logout, isDarkMode, toggleTheme } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair do aplicativo?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} items-center justify-center`}>
          
              <TouchableOpacity
                onPress={toggleTheme}
                className={`w-24 h-12 rounded-full items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
              >
                <Text className="text-2xl text-red-500">{isDarkMode ? 'Dark' : 'Ligth'}</Text>
              </TouchableOpacity>
              
      <View className="p-5 pb-4 w-full">
        <TouchableOpacity
          className="  bg-red-500 rounded-2xl py-5 items-center shadow-2xl shadow-red-500/30"
          onPress={handleLogout}
        >
          <Text className="text-white text-xl font-bold">Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;