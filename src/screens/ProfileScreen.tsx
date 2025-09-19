import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
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
  Moon
} from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';

type ProfileScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, getCurrentUser, logout, isDarkMode, updateProfile, getProfile } = useAuth();
  const { notificacoesNaoLidas, refreshNotificacoes } = useNotifications();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);


  const handleRefreshUser = async () => {
    setIsRefreshing(true);
    const result = await getCurrentUser();
    await refreshNotificacoes();
    setIsRefreshing(false);

    if (!result.success) {
      Alert.alert('Erro', result.error || 'Erro ao atualizar dados do usuário');
    }
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
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

  const handleImageSelected = async (imageUri: string) => {
    setIsUpdatingProfile(true);
    try {
      const result = await updateProfile(imageUri);
      if (result.success) {
        Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao atualizar foto de perfil');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao atualizar foto de perfil');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleImageRemoved = async () => {
    setIsUpdatingProfile(true);
    try {
      const result = await updateProfile(null);
      if (result.success) {
        Alert.alert('Sucesso', 'Foto de perfil removida com sucesso!');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao remover foto de perfil');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao remover foto de perfil');
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

          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
            
                        <Image source={require('../../assets/images/logo_invert.png')} className="w-16 h-12 mr-4" />
                        <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                          Salas
                        </Text>
                      </View>
            <TouchableOpacity
              onPress={handleNotificationPress}
              className="p-2 relative"
            >
              <Bell 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
              {notificacoesNaoLidas > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center">
                  <Text className="text-white text-xs font-bold">
                    {notificacoesNaoLidas > 99 ? '99+' : notificacoesNaoLidas}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>


          <View className={`p-6 rounded-3xl mb-8 ${
            isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
          } backdrop-blur-sm border border-gray-200/20`}>
            <View className="items-center mb-6">
              <ProfileImagePicker
                currentImageUri={user.profile?.profile_picture}
                onImageSelected={handleImageSelected}
                onImageRemoved={handleImageRemoved}
                size={100}
              />
              <Text className={`text-2xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {user.username}
              </Text>
              <View className="flex-row items-center mt-2">
                {user.is_superuser ? (
                  <Crown size={18} color={SENAC_COLORS.secondary} />
                ) : (
                  <User size={18} color={SENAC_COLORS.primary} />
                )}
                <Text className={`ml-2 text-sm font-medium`} style={{
                  color: user.is_superuser 
                    ? SENAC_COLORS.secondary 
                    : SENAC_COLORS.primary
                }}>
                  {user.is_superuser ? 'Super Admin' : 'Usuário'}
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
