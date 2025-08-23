import React from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen: React.FC = () => {
  const { user, logout } = useAuth();

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
    <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">

      <View className="p-5 pb-4 w-full">
        <TouchableOpacity
          className="bg-red-500 rounded-xl py-4 items-center shadow-lg shadow-red-500/20"
          onPress={handleLogout}
        >
          <Text className="text-white text-lg font-semibold">Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;