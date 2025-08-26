import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import type { ProfileStackParamList } from '../types/navigation';
import { 
  User, 
  Mail, 
  Shield, 
  Crown, 
  Lock, 
  ArrowRight, 
  RefreshCw,
  LogOut,
  Sun,
  Moon
} from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, getCurrentUser, logout, isDarkMode, toggleTheme } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshUser = async () => {
    setIsRefreshing(true);
    const result = await getCurrentUser();
    setIsRefreshing(false);

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Erro ao atualizar dados do usuário');
    }
  };

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

  const navigateToChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const navigateToUserManagement = () => {
    navigation.navigate('UserManagement');
  };

  if (!user) {
    return (
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDarkMode ? '#3B82F6' : '#2563EB'} />
          <Text className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6 pb-8">

          <View className="flex-row items-center justify-between mb-8">
            <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Perfil
            </Text>
            <TouchableOpacity
              onPress={handleRefreshUser}
              disabled={isRefreshing}
              className="p-2"
            >
              <RefreshCw 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                style={{ transform: [{ rotate: isRefreshing ? '360deg' : '0deg' }] }}
              />
            </TouchableOpacity>
          </View>


          <View className={`p-6 rounded-3xl mb-8 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          } backdrop-blur-sm border border-gray-200/20`}>
            <View className="items-center mb-6">
              <View className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
                isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
              }`}>
                <User size={40} color={SENAC_COLORS.primary} />
              </View>
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.username}
              </Text>
              <View className="flex-row items-center mt-2">
                {user.is_superuser ? (
                  <Crown size={18} color={SENAC_COLORS.secondary} />
                ) : user.is_staff ? (
                  <Shield size={18} color={SENAC_COLORS.primary} />
                ) : (
                  <User size={18} color={SENAC_COLORS.primary} />
                )}
                <Text className={`ml-2 text-sm font-medium`} style={{
                  color: user.is_superuser 
                    ? SENAC_COLORS.secondary 
                    : user.is_staff 
                    ? SENAC_COLORS.primary 
                    : SENAC_COLORS.primary
                }}>
                  {user.is_superuser 
                    ? 'Super Admin' 
                    : user.is_staff 
                    ? 'Administrador' 
                    : 'Usuário'
                  }
                </Text>
              </View>
            </View>


            <View className="space-y-4">
              <View className="flex-row items-center">
                <Mail size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                <Text className={`ml-3 flex-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Email
                </Text>
                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.email || 'Não informado'}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Shield size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                <Text className={`ml-3 flex-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  ID
                </Text>
                <Text className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  #{user.id}
                </Text>
              </View>
            </View>
          </View>


          <View className="space-y-4">

            <TouchableOpacity
              onPress={navigateToChangePassword}
              className={`flex-row items-center justify-between p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              } backdrop-blur-sm border border-gray-200/20`}
            >
              <View className="flex-row items-center">
                                 <View className={`w-10 h-10 rounded-full items-center justify-center mr-3`} 
                   style={{ backgroundColor: `${SENAC_COLORS.primary}20` }}>
                   <Lock size={20} color={SENAC_COLORS.primary} />
                 </View>
                <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Alterar Senha
                </Text>
              </View>
              <ArrowRight size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>


            {(user.is_staff || user.is_superuser) && (
              <TouchableOpacity
                onPress={navigateToUserManagement}
                className={`flex-row items-center justify-between p-4 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
                } backdrop-blur-sm border border-gray-200/20`}
              >
                <View className="flex-row items-center">
                                     <View className={`w-10 h-10 rounded-full items-center justify-center mr-3`} 
                     style={{ backgroundColor: `${SENAC_COLORS.secondary}20` }}>
                     <Shield size={20} color={SENAC_COLORS.secondary} />
                   </View>
                  <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Gerenciar Usuários
                  </Text>
                </View>
                <ArrowRight size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}


            <TouchableOpacity
              onPress={toggleTheme}
              className={`flex-row items-center justify-between p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              } backdrop-blur-sm border border-gray-200/20`}
            >
              <View className="flex-row items-center">
                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3`} 
                  style={{ backgroundColor: `${isDarkMode ? SENAC_COLORS.secondary : SENAC_COLORS.primary}20` }}>
                  {isDarkMode ? (
                    <Sun size={20} color={SENAC_COLORS.secondary} />
                  ) : (
                    <Moon size={20} color={SENAC_COLORS.primary} />
                  )}
                </View>
                <Text className={`text-base font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
                </Text>
              </View>
              <ArrowRight size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>


          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center p-4 rounded-2xl backdrop-blur-sm mt-8"
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

export default ProfileScreen;
