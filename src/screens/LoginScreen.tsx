import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isDarkMode } = useAuth();

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
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-center px-6">
          <View className="items-center mb-12">
            <View className="w-24 h-24 bg-senac-blue rounded-3xl items-center justify-center mb-8 shadow-2xl shadow-senac-blue/30">
              <Text className="text-white text-4xl font-black">S</Text>
            </View>
            <Text className={`text-4xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Bem-vindo
            </Text>
            <Text className={`text-center text-lg leading-7 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Entre com suas credenciais para acessar o sistema
            </Text>
          </View>

          <View className="mb-12 space-y-6">
            <View>
              <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Usuário
              </Text>
              <TextInput
                className={`border-2 rounded-2xl px-5 py-5 text-lg font-medium shadow-lg ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
                placeholder="Digite seu usuário"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#8E8E93'}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Senha
              </Text>
              <TextInput
                className={`border-2 rounded-2xl px-5 py-5 text-lg font-medium shadow-lg ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-white' 
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
                placeholder="Digite sua senha"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#8E8E93'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              className={`rounded-2xl py-5 items-center mt-4 shadow-2xl shadow-senac-blue/30 ${
                isLoading ? 'opacity-60' : 'opacity-100'
              }`}
              style={{ backgroundColor: '#0066CC' }}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="large" />
              ) : (
                <Text className="text-white text-xl font-bold">Entrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;