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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupsContext';
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
  is_superuser: boolean;
  groups: number[];
  profile: {
    profile_picture: string | null;
  };
}

type UserManagementScreenNavigationProp = StackNavigationProp<ProfileStackParamList>;

const UserManagementScreen: React.FC = () => {
  const navigation = useNavigation<UserManagementScreenNavigationProp>();
  const { user: currentUser, listUsers, createUser, isDarkMode } = useAuth();
  const { groups, carregarGrupos, getGroupName } = useGroups();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);

  const getImageUrl = (profilePicture: string | null): string | null => {
    if (!profilePicture || profilePicture.trim() === '') {
      return null;
    }
    
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }
    
    return `https://zeladoria.tsr.net.br${profilePicture}`;
  };

  useEffect(() => {
    loadUsers();
    carregarGrupos();
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
    
    const userData: any = {
      username: newUsername.trim(),
      email: newEmail.trim(),
      password: newPassword,
      confirm_password: confirmPassword,
      is_superuser: isSuperuser,
    };
    
    if (selectedGroups.length > 0) {
      userData.groups = selectedGroups;
    }
    
    const result = await createUser(userData);
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
    setIsSuperuser(false);
    setSelectedGroups([]);
  };

  const openUserDetails = (user: User) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const getUserRole = (user: User): string => {
    let roles: string[] = [];
    
    if (user.is_superuser) {
      roles.push('Administrador');
    }
    
    if (user.groups && user.groups.length > 0) {
      const groupNames = user.groups.map(groupId => getGroupName(groupId));
      roles.push(...groupNames);
    }
    
    if (roles.length === 0) {
      roles.push('Usuário');
    }
    
    return roles.join(', ');
  };

  const getUserRoleColor = (user: User): string => {
    if (user.is_superuser) {
      return SENAC_COLORS.secondary;
    }
    
    if (user.groups && user.groups.length > 0) {
      const firstGroupName = getGroupName(user.groups[0]);
      if (firstGroupName === 'Zeladoria') {
        return '#10B981';
      } else if (firstGroupName === 'Solicitante de Serviços') {
        return '#3B82F6';
      }
    }
    
    return SENAC_COLORS.primary;
  };

  const isAdmin = currentUser?.is_superuser;

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
                  <View className="flex-row items-center flex-1">
                    <View className="mr-4">
                      {(() => {
                        const imageUrl = getImageUrl(user.profile?.profile_picture);
                        return imageUrl ? (
                          <Image
                            source={{ uri: imageUrl }}
                            className="w-12 h-12 rounded-full"
                            style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
                            defaultSource={require('../../assets/images/logo.png')}
                          />
                        ) : (
                          <View 
                            className="w-12 h-12 rounded-full items-center justify-center"
                            style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
                          >
                            <User size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                          </View>
                        );
                      })()}
                    </View>
                    
                    <View className="flex-1">
                      <View className="flex-row items-center">
                        <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {user.username}
                        </Text>
                        {user.is_superuser && (
                          <Crown size={16} color={SENAC_COLORS.secondary} style={{ marginLeft: 8 }} />
                        )}
                      </View>
                      <Text className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {user.email || 'Sem email'}
                      </Text>
                      <View className="flex-row mt-3">
                        <View className="px-2 py-1 rounded-full" style={{ backgroundColor: `${getUserRoleColor(user)}20` }}>
                          <Text style={{ color: getUserRoleColor(user) }} className="text-xs font-medium">
                            {getUserRole(user)}
                          </Text>
                        </View>
                      </View>
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
                <Text className={`font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tipo de Usuário
                </Text>
                
                <TouchableOpacity
                  onPress={() => {
                    setIsSuperuser(!isSuperuser);
                  }}
                  className="flex-row items-center mb-3 p-3 rounded-xl border"
                  style={{
                    backgroundColor: isSuperuser ? `${SENAC_COLORS.secondary}10` : 'transparent',
                    borderColor: isSuperuser ? SENAC_COLORS.secondary : (isDarkMode ? '#374151' : '#D1D5DB')
                  }}
                >
                  <View className={`w-5 h-5 border rounded mr-3 ${
                    isSuperuser ? 'bg-yellow-500 border-yellow-500' : 'border-gray-400'
                  }`}>
                    {isSuperuser && <Check size={16} color="white" />}
                  </View>
                  <Crown size={20} color={isSuperuser ? SENAC_COLORS.secondary : (isDarkMode ? '#9CA3AF' : '#6B7280')} />
                  <View className="ml-3 flex-1">
                    <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Administrador
                    </Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Acesso total ao sistema
                    </Text>
                  </View>
                </TouchableOpacity>
                
                {groups.length > 0 && (
                  <>
                    <Text className={`font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Grupos adicionais (pode selecionar múltiplos):
                    </Text>
                    <Text className={`text-xs mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {isSuperuser 
                        ? 'Administradores podem ter grupos adicionais para funcionalidades específicas'
                        : 'Selecione os grupos que o usuário participará'
                      }
                    </Text>
                    {groups.map((group) => {
                      const isSelected = selectedGroups.includes(group.id);
                      const getGroupIcon = (groupName: string) => {
                        if (groupName === 'Zeladoria') return Shield;
                        if (groupName === 'Solicitante de Serviços') return User;
                        return User;
                      };
                      const getGroupColor = (groupName: string) => {
                        if (groupName === 'Zeladoria') return '#10B981';
                        if (groupName === 'Solicitante de Serviços') return '#3B82F6';
                        return '#6B7280';
                      };
                      const getGroupDescription = (groupName: string) => {
                        if (groupName === 'Zeladoria') return 'Gerencia salas e registros de limpeza';
                        if (groupName === 'Solicitante de Serviços') return 'Visualiza salas e pode solicitar limpeza';
                        return 'Acesso específico do grupo';
                      };

                      const IconComponent = getGroupIcon(group.name);
                      const groupColor = getGroupColor(group.name);
                      
                      return (
                        <TouchableOpacity
                          key={group.id}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedGroups(prev => prev.filter(id => id !== group.id));
                            } else {
                              setSelectedGroups(prev => [...prev, group.id]);
                            }
                          }}
                          className="flex-row items-center mb-3 p-3 rounded-xl border"
                          style={{
                            backgroundColor: isSelected ? `${groupColor}10` : 'transparent',
                            borderColor: isSelected ? groupColor : (isDarkMode ? '#374151' : '#D1D5DB')
                          }}
                        >
                          <View className={`w-5 h-5 border rounded mr-3 ${
                            isSelected ? `bg-[${groupColor}] border-[${groupColor}]` : 'border-gray-400'
                          }`} style={{
                            backgroundColor: isSelected ? groupColor : 'transparent',
                            borderColor: isSelected ? groupColor : '#9CA3AF'
                          }}>
                            {isSelected && <Check size={16} color="white" />}
                          </View>
                          <IconComponent size={20} color={isSelected ? groupColor : (isDarkMode ? '#9CA3AF' : '#6B7280')} />
                          <View className="ml-3 flex-1">
                            <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {group.name}
                            </Text>
                            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {getGroupDescription(group.name)}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </>
                )}
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
                <View className="items-center mb-6">
                  {(() => {
                    const imageUrl = getImageUrl(selectedUser.profile?.profile_picture);
                    return imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        className="w-20 h-20 rounded-full mb-3"
                        style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
                        defaultSource={require('../../assets/images/logo.png')}
                      />
                    ) : (
                      <View 
                        className="w-20 h-20 rounded-full items-center justify-center mb-3"
                        style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
                      >
                        <User size={32} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      </View>
                    );
                  })()}
                  <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
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
                  <View 
                    className="px-3 py-2 rounded-xl"
                    style={{ backgroundColor: `${getUserRoleColor(selectedUser)}20` }}
                  >
                    <Text 
                      className="font-medium"
                      style={{ color: getUserRoleColor(selectedUser) }}
                    >
                      {getUserRole(selectedUser)}
                    </Text>
                    {selectedUser.is_superuser && (
                      <Text className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Acesso total ao sistema
                        {selectedUser.groups && selectedUser.groups.length > 0 && 
                          ` + ${selectedUser.groups.length} grupo(s) adicional(is)`
                        }
                      </Text>
                    )}
                    {!selectedUser.is_superuser && selectedUser.groups && selectedUser.groups.length > 0 && (
                      <Text className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedUser.groups.length === 1 
                          ? (getGroupName(selectedUser.groups[0]) === 'Zeladoria'
                              ? 'Gerencia salas e registros de limpeza'
                              : 'Visualiza salas e pode solicitar limpeza'
                            )
                          : `${selectedUser.groups.length} grupos selecionados`
                        }
                      </Text>
                    )}
                  </View>
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
