import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth, isAdmin } from '../contexts/AuthContext';
import type { ProfileStackParamList } from '../types/navigation';
import { 
  Settings as SettingsIcon,
  Moon,
  Sun,
  Users,
  Lock,
  ArrowLeft,
  ChevronRight,
  UserCheck,
  Shield,
  Crown
} from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';

type SettingsScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { user, isDarkMode, toggleTheme } = useAuth();

  const handleUserManagement = () => {
    if (!isAdmin(user)) {
      Alert.alert('Acesso Negado', 'Apenas administradores podem acessar esta funcionalidade.');
      return;
    }
    navigation.navigate('UserManagement');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const getUserRole = () => {
    if (user?.is_superuser) {
      return { name: 'Administrador', icon: Crown, color: SENAC_COLORS.secondary };
    }
    
    if (user?.groups && user.groups.length > 0) {
      switch (user.groups[0]) {
        case 1:
          return { name: 'Zeladoria', icon: Shield, color: '#10B981' };
        case 2:
          return { name: 'Corpo Docente', icon: UserCheck, color: '#3B82F6' };
        default:
          return { name: 'Usuário', icon: UserCheck, color: SENAC_COLORS.primary };
      }
    }
    
    return { name: 'Usuário', icon: UserCheck, color: SENAC_COLORS.primary };
  };

  const userRole = getUserRole();
  const RoleIcon = userRole.icon;

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <View className="flex-1 px-6">
        <View className="flex-row items-center justify-between py-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <ArrowLeft size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Configurações
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className={`p-6 rounded-3xl mb-8 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
            <View className="flex-row items-center mb-4">
              <SettingsIcon size={24} color={SENAC_COLORS.primary} />
              <Text className={`text-lg font-bold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Informações da Conta
              </Text>
            </View>
            
            <View className="flex-row items-center">
              <View className="mr-4">
                {user?.profile?.profile_picture ? (
                  <Image
                    source={{ uri: user.profile.profile_picture }}
                    className="w-16 h-16 rounded-full"
                    style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
                  />
                ) : (
                  <View className={`w-16 h-16 rounded-full items-center justify-center ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
                  }`}>
                    <RoleIcon size={32} color={userRole.color} />
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.username}
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {userRole.name}
                </Text>
                <Text className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {user?.email || 'Sem email'}
                </Text>
              </View>
            </View>
          </View>

          <View className={`p-6 rounded-3xl mb-8 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
            <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Aparência
            </Text>
            
            <View
              className="flex-row items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
            >
              <View className="flex-row items-center flex-1">
                {isDarkMode ? (
                  <Moon size={24} color={SENAC_COLORS.secondary} />
                ) : (
                  <Sun size={24} color={SENAC_COLORS.primary} />
                )}
                <Text className={`ml-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isDarkMode ? 'Modo Escuro' : 'Modo Claro'}
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ 
                  false: '#D1D5DB', 
                  true: SENAC_COLORS.primary 
                }}
                thumbColor={isDarkMode ? '#FFFFFF' : '#F3F4F6'}
                ios_backgroundColor="#D1D5DB"
              />
            </View>
          </View>

          <View className={`p-6 rounded-3xl mb-8 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
            <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Conta e Segurança
            </Text>
            
            <TouchableOpacity
              onPress={handleChangePassword}
              className="flex-row items-center justify-between p-4 rounded-xl mb-3"
              style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
            >
              <View className="flex-row items-center">
                <Lock size={24} color={SENAC_COLORS.primary} />
                <Text className={`ml-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Alterar Senha
                </Text>
              </View>
              <ChevronRight size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>

            {isAdmin(user) && (
              <TouchableOpacity
                onPress={handleUserManagement}
                className="flex-row items-center justify-between p-4 rounded-xl"
                style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
              >
                <View className="flex-row items-center">
                  <Users size={24} color={SENAC_COLORS.secondary} />
                  <Text className={`ml-3 font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Gerenciar Usuários
                  </Text>
                </View>
                <ChevronRight size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;
