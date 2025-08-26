import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import type { ProfileStackParamList } from '../types/navigation';
import { 
  Users, 
  UserPlus, 
  Eye, 
  X, 
  Check,
  User,
  Mail,
  Shield,
  Crown,
  ArrowLeft
} from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';

interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
}

type UserManagementScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const UserManagementScreen: React.FC = () => {
  const navigation = useNavigation<UserManagementScreenNavigationProp>();
  const { user: currentUser, listUsers, createUser, isDarkMode } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form states
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [isSuperuser, setIsSuperuser] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const result = await listUsers();
    setIsLoading(false);

    if (result.success && result.users) {
      setUsers(result.users);
    } else {
      Alert.alert('Erro', result.error || 'Erro ao carregar usuários');
    }
  };

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setIsLoading(true);
    const result = await createUser({
      username: newUsername.trim(),
      email: newEmail.trim(),
      password: newPassword,
      confirm_password: confirmPassword,
      is_staff: isStaff,
      is_superuser: isSuperuser,
    });
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Sucesso', 'Usuário criado com sucesso!');
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } else {
      Alert.alert('Erro', result.error || 'Erro ao criar usuário');
    }
  };

  const resetForm = () => {
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setIsStaff(false);
    setIsSuperuser(false);
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const isAdmin = currentUser?.is_staff || currentUser?.is_superuser;

  if (!isAdmin) {
    return (
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
        <View className="flex-1 justify-center items-center px-6">
          <Shield size={64} color={isDarkMode ? '#EF4444' : '#DC2626'} />
          <Text className={`text-xl font-bold mt-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Acesso Negado
          </Text>
          <Text className={`text-center mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Você não tem permissão para acessar esta área.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
              Usuários
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className={`flex-row items-center px-4 py-2 rounded-xl`}
            style={{ backgroundColor: SENAC_COLORS.primary }}
          >
            <UserPlus size={18} color="white" />
            <Text className="text-white font-semibold ml-2">Novo</Text>
          </TouchableOpacity>
        </View>


        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View className="flex-1 justify-center items-center py-20">
              <ActivityIndicator size="large" color={isDarkMode ? '#3B82F6' : '#2563EB'} />
              <Text className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Carregando usuários...
              </Text>
            </View>
          ) : users.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Users size={64} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
              <Text className={`text-lg font-semibold mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Nenhum usuário encontrado
              </Text>
            </View>
          ) : (
            users.map((user) => (
              <TouchableOpacity
                key={user.id}
                onPress={() => openUserDetails(user)}
                className={`mb-4 p-4 rounded-2xl border ${
                  isDarkMode 
                    ? 'bg-gray-800/50 border-gray-700/30' 
                    : 'bg-white/80 border-gray-200/30'
                } backdrop-blur-sm`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center">
                      <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.username}
                      </Text>
                      {user.is_superuser && (
                        <Crown size={16} color={SENAC_COLORS.secondary} style={{ marginLeft: 8 }} />
                      )}
                      {user.is_staff && !user.is_superuser && (
                        <Shield size={16} color={SENAC_COLORS.primary} style={{ marginLeft: 8 }} />
                      )}
                    </View>
                    <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {user.email || 'Sem email'}
                    </Text>
                    <View className="flex-row mt-3">
                      {user.is_superuser && (
                        <View className="px-2 py-1 rounded-full mr-2" style={{ backgroundColor: `${SENAC_COLORS.secondary}20` }}>
                          <Text style={{ color: SENAC_COLORS.secondary }} className="text-xs font-medium">Super Admin</Text>
                        </View>
                      )}
                      {user.is_staff && !user.is_superuser && (
                        <View className="px-2 py-1 rounded-full mr-2" style={{ backgroundColor: `${SENAC_COLORS.primary}20` }}>
                          <Text style={{ color: SENAC_COLORS.primary }} className="text-xs font-medium">Admin</Text>
                        </View>
                      )}
                      {!user.is_staff && !user.is_superuser && (
                        <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${SENAC_COLORS.primary}20` }}>
                          <Text style={{ color: SENAC_COLORS.primary }} className="text-xs font-medium">Usuário</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <Eye size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>


      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`w-11/12 max-w-md p-6 rounded-3xl ${
            isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
          } backdrop-blur-sm border border-gray-200/20`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Novo Usuário
              </Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <X size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
              <View className="mb-4">
                <Text className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Usuário *
                </Text>
                <TextInput
                  className={`border border-gray-300/30 rounded-xl px-3 py-3 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600/30 text-white' 
                      : 'bg-gray-50/50 border-gray-300/30 text-gray-900'
                  } backdrop-blur-sm`}
                  placeholder="Nome de usuário"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  value={newUsername}
                  onChangeText={setNewUsername}
                />
              </View>

              <View className="mb-4">
                <Text className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Email
                </Text>
                <TextInput
                  className={`border border-gray-300/30 rounded-xl px-3 py-3 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600/30 text-white' 
                      : 'bg-gray-50/50 border-gray-300/30 text-gray-900'
                  } backdrop-blur-sm`}
                  placeholder="email@exemplo.com"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-4">
                <Text className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Senha *
                </Text>
                <TextInput
                  className={`border border-gray-300/30 rounded-xl px-3 py-3 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600/30 text-white' 
                      : 'bg-gray-50/50 border-gray-300/30 text-gray-900'
                  } backdrop-blur-sm`}
                  placeholder="Senha"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <View className="mb-4">
                <Text className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Confirmar Senha *
                </Text>
                <TextInput
                  className={`border border-gray-300/30 rounded-xl px-3 py-3 ${
                    isDarkMode 
                      ? 'bg-gray-700/50 border-gray-600/30 text-white' 
                      : 'bg-gray-50/50 border-gray-300/30 text-gray-900'
                  } backdrop-blur-sm`}
                  placeholder="Confirmar senha"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>

              <View className="mb-4">
                <TouchableOpacity
                  onPress={() => setIsStaff(!isStaff)}
                  className="flex-row items-center mb-3"
                >
                  <View className={`w-5 h-5 border rounded mr-3 ${
                    isStaff ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                  }`}>
                    {isStaff && <Check size={16} color="white" />}
                  </View>
                  <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    É Administrador
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsSuperuser(!isSuperuser)}
                  className="flex-row items-center"
                >
                  <View className={`w-5 h-5 border rounded mr-3 ${
                    isSuperuser ? 'bg-yellow-500 border-yellow-500' : 'border-gray-400'
                  }`}>
                    {isSuperuser && <Check size={16} color="white" />}
                  </View>
                  <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    É Super Administrador
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View className="flex-row space-x-3 mt-6">
              <TouchableOpacity
                onPress={() => setShowCreateModal(false)}
                className={`flex-1 py-3 rounded-xl border ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                }`}
              >
                <Text className={`text-center font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Cancelar
                </Text>
              </TouchableOpacity>
                              <TouchableOpacity
                  onPress={handleCreateUser}
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl"
                  style={{ backgroundColor: SENAC_COLORS.primary }}
                >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-semibold">Criar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        visible={showUserDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowUserDetails(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className={`w-11/12 max-w-md p-6 rounded-3xl ${
            isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
          } backdrop-blur-sm border border-gray-200/20`}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Detalhes do Usuário
              </Text>
              <TouchableOpacity onPress={() => setShowUserDetails(false)}>
                <X size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <View>
                <View className="flex-row items-center mb-4">
                  <User size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <Text className={`text-lg font-semibold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {selectedUser.username}
                  </Text>
                </View>

                <View className="flex-row items-center mb-4">
                  <Mail size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <Text className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedUser.email || 'Sem email'}
                  </Text>
                </View>

                <View className="flex-row items-center mb-4">
                  <Shield size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                  <Text className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    ID: {selectedUser.id}
                  </Text>
                </View>

                <View className="space-y-2">
                  {selectedUser.is_superuser && (
                    <View className="bg-yellow-100/80 px-3 py-2 rounded-xl">
                      <Text className="text-yellow-800 font-medium">Super Administrador</Text>
                    </View>
                  )}
                  {selectedUser.is_staff && !selectedUser.is_superuser && (
                    <View className="bg-blue-100/80 px-3 py-2 rounded-xl">
                      <Text className="text-blue-800 font-medium">Administrador</Text>
                    </View>
                  )}
                  {!selectedUser.is_staff && !selectedUser.is_superuser && (
                    <View className="bg-gray-100/80 px-3 py-2 rounded-xl">
                      <Text className="text-gray-800 font-medium">Usuário Comum</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => setShowUserDetails(false)}
              className="py-3 rounded-xl mt-6"
              style={{ backgroundColor: SENAC_COLORS.primary }}
            >
              <Text className="text-white text-center font-semibold">Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default UserManagementScreen;
