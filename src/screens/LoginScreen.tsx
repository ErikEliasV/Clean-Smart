import React, { useState, useRef, useEffect } from 'react';
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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const { login, isDarkMode } = useAuth();
  
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ 
            flexGrow: 1,
            paddingBottom: isKeyboardVisible ? 100 : 50
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View className={`flex-1 justify-center px-6 py-8 ${isKeyboardVisible ? 'pt-4' : 'pt-8'}`}>
            <View className="items-center mb-4">
              <Image 
                source={require('../../assets/images/logo_name.png')} 
                style={{
                  width: isKeyboardVisible ? 192 : 256, // w-48 = 192px, w-64 = 256px
                  height: isKeyboardVisible ? 120 : 160, // h-30 = 120px, h-40 = 160px
                  marginBottom: isKeyboardVisible ? 16 : 32, // mb-4 = 16px, mb-8 = 32px
                  resizeMode: 'contain'
                }}
              />
              <Text className={`${isKeyboardVisible ? 'text-2xl' : 'text-3xl'} font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Bem-vindo
              </Text>
              {!isKeyboardVisible && (
                <Text className={`text-center text-base leading-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Entre com suas credenciais para acessar o sistema
                </Text>
              )}
            </View>

            <View className={`${isKeyboardVisible ? 'mb-6' : 'mb-12'} space-y-6`}>
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