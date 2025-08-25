import React from 'react';
import { View, Text, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Lock, 
  LogOut, 
  Sun,
  Moon,
  Shield,
  Crown,
  Building,
  Bell
} from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';

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
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">

          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Olá, {user?.username}!
              </Text>
              <Text className={`text-base mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Bem-vindo ao sistema de zeladoria
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              } backdrop-blur-sm border border-gray-200/20`}
            >
              {isDarkMode ? (
                <Sun size={24} color={SENAC_COLORS.secondary} />
              ) : (
                <Moon size={24} color={SENAC_COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>


          <View className={`p-6 rounded-3xl mb-8 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          } backdrop-blur-sm border border-gray-200/20`}>
            <View className="flex-row items-center">
              <View className={`w-16 h-16 rounded-full items-center justify-center mr-4 ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
              }`}>
                {user?.is_superuser ? (
                  <Crown size={32} color={SENAC_COLORS.secondary} />
                ) : user?.is_staff ? (
                  <Shield size={32} color={SENAC_COLORS.primary} />
                ) : (
                  <User size={32} color={SENAC_COLORS.primary} />
                )}
              </View>
              <View className="flex-1">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.username}
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.email || 'Sem email'}
                </Text>
                <View className="flex-row mt-2">
                  {user?.is_superuser && (
                    <View className="px-2 py-1 rounded-full mr-2" style={{ backgroundColor: `${SENAC_COLORS.secondary}20` }}>
                      <Text style={{ color: SENAC_COLORS.secondary }} className="text-xs font-medium">Super Admin</Text>
                    </View>
                  )}
                  {user?.is_staff && (
                    <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${SENAC_COLORS.primary}20` }}>
                      <Text style={{ color: SENAC_COLORS.primary }} className="text-xs font-medium">Admin</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>


          <View className="mb-8">
            <Text className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Resumo
            </Text>
            
            <View className="grid grid-cols-2 gap-4">
              <View className={`p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              } backdrop-blur-sm border border-gray-200/20`}>
                <View className="flex-row items-center">
                                     <View className={`w-10 h-10 rounded-full items-center justify-center mr-3`} 
                     style={{ backgroundColor: `${SENAC_COLORS.primary}20` }}>
                     <Building size={20} color={SENAC_COLORS.primary} />
                   </View>
                  <View>
                    <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      12
                    </Text>
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Prédios
                    </Text>
                  </View>
                </View>
              </View>

              <View className={`p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              } backdrop-blur-sm border border-gray-200/20`}>
                <View className="flex-row items-center">
                                     <View className={`w-10 h-10 rounded-full items-center justify-center mr-3`} 
                     style={{ backgroundColor: `${SENAC_COLORS.secondary}20` }}>
                     <Bell size={20} color={SENAC_COLORS.secondary} />
                   </View>
                  <View>
                    <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      5
                    </Text>
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Alertas
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>


          <View className={`p-6 rounded-3xl mb-8 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          } backdrop-blur-sm border border-gray-200/20`}>
            <View className="flex-row items-center mb-4">
              <Building size={24} color={SENAC_COLORS.primary} />
              <Text className={`text-lg font-bold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Informações do Sistema
              </Text>
            </View>
            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Versão do App
                </Text>
                <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  1.0.0
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Status
                </Text>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <Text className="text-green-600 font-medium">Online</Text>
                </View>
              </View>
              <View className="flex-row justify-between">
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Última Atualização
                </Text>
                <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Hoje
                </Text>
              </View>
            </View>
          </View>


          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center p-4 rounded-2xl backdrop-blur-sm"
            style={{ backgroundColor: `${SENAC_COLORS.error}E6` }}
          >
            <LogOut size={20} color="white" />
            <Text className="ml-3 text-base font-medium text-white">
              Sair do Aplicativo
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;