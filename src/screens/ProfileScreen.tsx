import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth, isAdmin, isZelador, isCorpoDocente } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { useGroups } from '../contexts/GroupsContext';
import type { ProfileStackParamList } from '../types/navigation';
import ProfileImagePicker from '../components/ProfileImagePicker';
import { 
  User, 
  Mail, 
  Shield, 
  Crown, 
  Lock, 
  ArrowRight, 
  Bell,
  LogOut,
  Sun,
  Moon,
  Settings,
  Users,
  Calendar,
  Award,
  Briefcase
} from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, getCurrentUser, logout, isDarkMode, updateProfile, getProfile, toggleTheme } = useAuth();
  const { notificacoesNaoLidas, refreshNotificacoes } = useNotifications();
  const { groups, getGroupName } = useGroups();
  const { alertVisible, alertOptions, showAlert, hideAlert } = useCustomAlert();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleRefreshUser = async () => {
    setIsRefreshing(true);
    const result = await getCurrentUser();
    await refreshNotificacoes();
    setIsRefreshing(false);

    if (!result.success) {
      showAlert({
        title: 'Erro',
        message: result.error || 'Erro ao atualizar dados do usuário',
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const handleLogout = () => {
    showAlert({
      title: 'Sair da Conta',
      message: 'Tem certeza que deseja sair da sua conta?',
      type: 'warning',
      confirmText: 'Sair',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: logout
    });
  };

  const navigateToChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const navigateToUserManagement = () => {
    navigation.navigate('UserManagement');
  };

  const handleImageSelected = async (imageUri: string) => {
    setIsUpdatingProfile(true);
    try {
      const result = await updateProfile(imageUri);
      if (result.success) {
        showAlert({
          title: 'Sucesso',
          message: 'Foto de perfil atualizada com sucesso!',
          type: 'success',
          confirmText: 'OK'
        });
      } else {
        showAlert({
          title: 'Erro',
          message: result.error || 'Erro ao atualizar foto de perfil',
          type: 'error',
          confirmText: 'OK'
        });
      }
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Erro ao atualizar foto de perfil',
        type: 'error',
        confirmText: 'OK'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleImageRemoved = async () => {
    setIsUpdatingProfile(true);
    try {
      const result = await updateProfile(null);
      if (result.success) {
        showAlert({
          title: 'Sucesso',
          message: 'Foto de perfil removida com sucesso!',
          type: 'success',
          confirmText: 'OK'
        });
      } else {
        showAlert({
          title: 'Erro',
          message: result.error || 'Erro ao remover foto de perfil',
          type: 'error',
          confirmText: 'OK'
        });
      }
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Erro ao remover foto de perfil',
        type: 'error',
        confirmText: 'OK'
      });
    } finally {
      setIsUpdatingProfile(false);
    }
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
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefreshUser}
            colors={[SENAC_COLORS.primary]}
            tintColor={SENAC_COLORS.primary}
          />
        }
      >
        <View className="px-6 py-6 pb-8">

          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Meu Perfil
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={toggleTheme}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
              >
                {isDarkMode ? (
                  <Sun size={22} color={SENAC_COLORS.secondary} />
                ) : (
                  <Moon size={22} color={SENAC_COLORS.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleNotificationPress}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} relative`}
              >
                <Bell size={22} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                {notificacoesNaoLidas > 0 && (
                  <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center">
                    <Text className="text-white text-[10px] font-bold">
                      {notificacoesNaoLidas > 9 ? '9+' : notificacoesNaoLidas}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Card do Perfil */}
          <View className={`p-6 rounded-3xl mb-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'} shadow-lg`}>
            <View className="items-center mb-6">
              <ProfileImagePicker
                currentImageUri={user.profile?.profile_picture}
                onImageSelected={handleImageSelected}
                onImageRemoved={handleImageRemoved}
                size={120}
              />
              {isUpdatingProfile && (
                <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center">
                  <ActivityIndicator size="large" color={SENAC_COLORS.primary} />
                </View>
              )}
              <Text className={`text-2xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.username}
              </Text>
              
              {/* Badges de Função */}
              <View className="flex-row flex-wrap justify-center mt-3 gap-2">
                {user.is_superuser && (
                  <View className={`flex-row items-center px-3 py-1.5 rounded-full ${
                    isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50'
                  }`}>
                    <Crown size={14} color={SENAC_COLORS.secondary} />
                    <Text className={`ml-1.5 text-xs font-semibold`} style={{ color: SENAC_COLORS.secondary }}>
                      Administrador
                    </Text>
                  </View>
                )}
                {isZelador(user, groups) && (
                  <View className={`flex-row items-center px-3 py-1.5 rounded-full ${
                    isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                  }`}>
                    <Briefcase size={14} color="#3B82F6" />
                    <Text className="ml-1.5 text-xs font-semibold text-blue-600">
                      Zelador
                    </Text>
                  </View>
                )}
                {isCorpoDocente(user, groups) && (
                  <View className={`flex-row items-center px-3 py-1.5 rounded-full ${
                    isDarkMode ? 'bg-green-900/30' : 'bg-green-50'
                  }`}>
                    <Award size={14} color="#10B981" />
                    <Text className="ml-1.5 text-xs font-semibold text-green-600">
                      Solicitante de Serviços
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Divisor */}
            <View className={`h-px my-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

            {/* Informações do Usuário */}
            <View className="space-y-4">
              <View className="flex-row items-center py-2">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Mail size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </View>
                <View className="flex-1 ml-3">
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Email
                  </Text>
                  <Text className={`text-sm font-medium mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.email || 'Não informado'}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center py-2">
                <View className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}>
                  <Shield size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </View>
                <View className="flex-1 ml-3">
                  <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ID do Usuário
                  </Text>
                  <Text className={`text-sm font-medium mt-0.5 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    #{user.id}
                  </Text>
                </View>
              </View>

              {user.groups && user.groups.length > 0 && (
                <View className="flex-row items-start py-2">
                  <View className={`w-10 h-10 rounded-full items-center justify-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Users size={18} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  </View>
                  <View className="flex-1 ml-3">
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Grupos
                    </Text>
                    <View className="flex-row flex-wrap gap-1 mt-1">
                      {user.groups.map((groupId, index) => (
                        <Text 
                          key={groupId} 
                          className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                        >
                          {getGroupName(groupId)}{index < user.groups.length - 1 ? ', ' : ''}
                        </Text>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>



          {/* Botão de Sair */}
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-center p-4 rounded-2xl"
            style={{ backgroundColor: `${SENAC_COLORS.error}` }}
          >
            <LogOut size={22} color="white" />
            <Text className="ml-3 text-base font-semibold text-white">
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertOptions.title}
        message={alertOptions.message}
        type={alertOptions.type}
        confirmText={alertOptions.confirmText}
        cancelText={alertOptions.cancelText}
        onConfirm={alertOptions.onConfirm}
        onCancel={alertOptions.onCancel}
        showCancel={alertOptions.showCancel}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;
