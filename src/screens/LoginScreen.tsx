import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Lock, User } from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isDarkMode } = useAuth();
  
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    const result = await login(username.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      Alert.alert('Erro de Login', result.error || 'Credenciais inválidas');
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 justify-center px-6 py-8">
            <View className="items-center mb-4">
              <Image source={require('../../assets/images/logo_name.png')} className="w-64 h-40 mb-8" />
              <Text className={`text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Bem-vindo
              </Text>
              <Text className={`text-center text-base leading-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Entre com suas credenciais para acessar o sistema
              </Text>
            </View>

            <View className="mb-12 space-y-6">
              <View>
                <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Usuário
                </Text>
                <View className="relative">
                  <TextInput
                    ref={usernameRef}
                    className={`border border-gray-300/30 rounded-2xl px-4 py-4 text-base font-medium ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-600/30 text-white' 
                        : 'bg-white/80 border-gray-200/30 text-gray-900'
                    } backdrop-blur-sm pl-12`}
                    placeholder="Digite seu usuário"
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#8E8E93'}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      passwordRef.current?.focus();
                    }}
                    blurOnSubmit={false}
                  />
                  <User 
                    size={20} 
                    color={SENAC_COLORS.primary} 
                    style={{ position: 'absolute', left: 16, top: 16 }}
                  />
                </View>
              </View>

              <View>
                <Text className={`text-base font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Senha
                </Text>
                <View className="relative">
                  <TextInput
                    ref={passwordRef}
                    className={`border border-gray-300/30 rounded-2xl px-4 py-4 text-base font-medium ${
                      isDarkMode 
                        ? 'bg-gray-800/50 border-gray-600/30 text-white' 
                        : 'bg-white/80 border-gray-200/30 text-gray-900'
                    } backdrop-blur-sm pl-12 pr-12`}
                    placeholder="Digite sua senha"
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#8E8E93'}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      Keyboard.dismiss();
                      handleLogin();
                    }}
                  />
                  <Lock 
                    size={20} 
                    color={SENAC_COLORS.primary} 
                    style={{ position: 'absolute', left: 16, top: 16 }}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 16, top: 16 }}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color={SENAC_COLORS.primary} />
                    ) : (
                      <Eye size={20} color={SENAC_COLORS.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                className={`rounded-2xl py-4 items-center mt-8 ${
                  isLoading ? 'opacity-60' : 'opacity-100'
                }`}
                style={{ backgroundColor: SENAC_COLORS.primary }}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="large" />
                ) : (
                  <Text className="text-white text-lg font-semibold">Entrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;