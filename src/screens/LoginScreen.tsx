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
  const { login } = useAuth();

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
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 justify-center px-6">
          {/* Header */}
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-senac-blue rounded-2xl items-center justify-center mb-6 shadow-lg shadow-senac-blue/20">
              <Text className="text-white text-3xl font-bold">S</Text>
            </View>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo</Text>
            <Text className="text-gray-500 text-center text-base leading-6">
              Entre com suas credenciais para acessar o sistema
            </Text>
          </View>

          {/* Form */}
          <View className="mb-12">
            <View className="mb-5">
              <Text className="text-gray-900 text-base font-semibold mb-2">Usuário</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base shadow-sm"
                placeholder="Digite seu usuário"
                placeholderTextColor="#8E8E93"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View className="mb-5">
              <Text className="text-gray-900 text-base font-semibold mb-2">Senha</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 text-base shadow-sm"
                placeholder="Digite sua senha"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              className={`bg-senac-blue rounded-xl py-4 items-center mt-2 shadow-lg shadow-senac-blue/20 ${isLoading ? 'opacity-60' : ''}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white text-lg font-semibold">Entrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;