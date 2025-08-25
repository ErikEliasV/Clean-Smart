import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import type { ProfileStackParamList } from '../types/navigation';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';

type ChangePasswordScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<ChangePasswordScreenNavigationProp>();
  const { changePassword, isDarkMode } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert('Erro', 'As novas senhas não coincidem.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    const result = await changePassword({
      old_password: oldPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword,
    });
    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        'Sucesso',
        'Senha alterada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              setOldPassword('');
              setNewPassword('');
              setConfirmNewPassword('');
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      Alert.alert('Erro', result.error || 'Erro ao alterar senha');
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 px-6">

          <View className="flex-row items-center py-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-4"
            >
              <ArrowLeft size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Alterar Senha
            </Text>
          </View>


          <View className="items-center mb-8">
            <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
            } backdrop-blur-sm border border-gray-200/20`}>
              <Lock size={32} color={SENAC_COLORS.primary} />
            </View>
            <Text className={`text-center text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Digite sua senha atual e a nova senha desejada
            </Text>
          </View>


          <View className="space-y-6">

            <View>
              <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Senha Atual
              </Text>
              <View className="relative">
                <TextInput
                  className={`border border-gray-300/30 rounded-2xl px-4 py-4 text-base font-medium ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-gray-600/30 text-white' 
                      : 'bg-white/80 border-gray-200/30 text-gray-900'
                  } backdrop-blur-sm pr-12`}
                  placeholder="Digite sua senha atual"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#8E8E93'}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-4 top-4"
                >
                  {showOldPassword ? (
                    <EyeOff size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  ) : (
                    <Eye size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>


            <View>
              <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Nova Senha
              </Text>
              <View className="relative">
                <TextInput
                  className={`border border-gray-300/30 rounded-2xl px-4 py-4 text-base font-medium ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-gray-600/30 text-white' 
                      : 'bg-white/80 border-gray-200/30 text-gray-900'
                  } backdrop-blur-sm pr-12`}
                  placeholder="Digite a nova senha"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#8E8E93'}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-4 top-4"
                >
                  {showNewPassword ? (
                    <EyeOff size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  ) : (
                    <Eye size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  )}
                </TouchableOpacity>
              </View>
              <Text className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Mínimo de 6 caracteres
              </Text>
            </View>


            <View>
              <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Confirmar Nova Senha
              </Text>
              <View className="relative">
                <TextInput
                  className={`border border-gray-300/30 rounded-2xl px-4 py-4 text-base font-medium ${
                    isDarkMode 
                      ? 'bg-gray-800/50 border-gray-600/30 text-white' 
                      : 'bg-white/80 border-gray-200/30 text-gray-900'
                  } backdrop-blur-sm pr-12`}
                  placeholder="Confirme a nova senha"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#8E8E93'}
                  value={confirmNewPassword}
                  onChangeText={setConfirmNewPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-4"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  ) : (
                    <Eye size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  )}
                </TouchableOpacity>
              </View>
            </View>


            <TouchableOpacity
              className={`rounded-2xl py-4 items-center mt-8 ${
                isLoading ? 'opacity-60' : 'opacity-100'
              }`}
              style={{ backgroundColor: SENAC_COLORS.primary }}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <Text className="text-white text-lg font-semibold">Alterar Senha</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChangePasswordScreen;
