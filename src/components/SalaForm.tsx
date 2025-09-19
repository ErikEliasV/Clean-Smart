import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { X, Save, Camera, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Sala, CreateSalaData, UpdateSalaData } from '../types/salas';
import { useAuth, canManageSalas, isZelador } from '../contexts/AuthContext';
import { useSalas } from '../contexts/SalasContext';
import { SENAC_COLORS } from '../constants/colors';

interface SalaFormProps {
  visible: boolean;
  onClose: () => void;
  sala?: Sala;
}

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

const SalaForm: React.FC<SalaFormProps> = ({ visible, onClose, sala }) => {
  const { isDarkMode, user, listUsers } = useAuth();
  const { createSala, updateSala } = useSalas();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome_numero: '',
    capacidade: '',
    validade_limpeza_horas: '4',
    descricao: '',
    instrucoes: '',
    localizacao: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [zeladores, setZeladores] = useState<User[]>([]);
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<string[]>([]);
  const [showResponsaveisModal, setShowResponsaveisModal] = useState(false);

  const isEditing = !!sala;

  useEffect(() => {
    if (sala) {
      setFormData({
        nome_numero: sala.nome_numero,
        capacidade: sala.capacidade.toString(),
        validade_limpeza_horas: sala.validade_limpeza_horas.toString(),
        descricao: sala.descricao || '',
        instrucoes: sala.instrucoes || '',
        localizacao: sala.localizacao,
      });
      setSelectedImage(sala.imagem || null);
      setSelectedResponsaveis(sala.responsaveis || []);
    } else {
      setFormData({
        nome_numero: '',
        capacidade: '',
        validade_limpeza_horas: '4',
        descricao: '',
        instrucoes: '',
        localizacao: '',
      });
      setSelectedImage(null);
      setSelectedResponsaveis([]);
    }
  }, [sala, visible]);

  useEffect(() => {
    if (visible) {
      loadZeladores();
    }
  }, [visible]);

  const loadZeladores = async () => {
    const result = await listUsers();
    if (result.success && result.users) {
      const zeladoresList = result.users.filter(user => 
        user.groups && user.groups.some(groupId => {
          return groupId === 1;
        })
      );
      setZeladores(zeladoresList);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.nome_numero.trim()) {
      Alert.alert('Erro', 'Nome/Número da sala é obrigatório');
      return false;
    }
    if (!formData.capacidade.trim()) {
      Alert.alert('Erro', 'Capacidade é obrigatória');
      return false;
    }
    const capacidadeNum = parseInt(formData.capacidade);
    if (isNaN(capacidadeNum) || capacidadeNum <= 0) {
      Alert.alert('Erro', 'Capacidade deve ser um número maior que zero');
      return false;
    }
    const validadeNum = parseInt(formData.validade_limpeza_horas);
    if (isNaN(validadeNum) || validadeNum <= 0) {
      Alert.alert('Erro', 'Validade da limpeza deve ser um número maior que zero');
      return false;
    }
    if (!formData.localizacao.trim()) {
      Alert.alert('Erro', 'Localização é obrigatória');
      return false;
    }
    return true;
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar sua galeria de fotos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsImageLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3, // Reduzido de 0.8 para 0.3 para menor tamanho
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    } finally {
      setIsImageLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'Precisamos de permissão para acessar sua câmera.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsImageLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3, // Reduzido de 0.8 para 0.3 para menor tamanho
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto.');
    } finally {
      setIsImageLoading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Selecionar Foto',
      'Escolha uma opção:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Galeria', onPress: pickImage },
        { text: 'Câmera', onPress: takePhoto },
      ]
    );
  };

  const removeImage = () => {
    Alert.alert(
      'Remover Foto',
      'Tem certeza que deseja remover a foto da sala?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => setSelectedImage(null) },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!canManageSalas(user)) {
      Alert.alert('Erro', 'Apenas administradores e zeladores podem criar/editar salas');
      return;
    }

    setIsLoading(true);

    try {
      console.log('=== SALA FORM DEBUG ===');
      console.log('isEditing:', isEditing);
      console.log('sala existente:', sala);
      console.log('selectedImage:', selectedImage);
      console.log('selectedResponsaveis:', selectedResponsaveis);
      
      const salaData = {
        nome_numero: formData.nome_numero.trim(),
        capacidade: parseInt(formData.capacidade),
        validade_limpeza_horas: parseInt(formData.validade_limpeza_horas),
        localizacao: formData.localizacao.trim(),
        descricao: formData.descricao.trim() || undefined,
        instrucoes: formData.instrucoes.trim() || undefined,
        responsaveis: selectedResponsaveis.length > 0 ? selectedResponsaveis : undefined,
        imagem: selectedImage ? {
          uri: selectedImage,
          type: 'image/jpeg',
          name: 'sala_image.jpg',
        } as any : (isEditing && sala?.imagem && !selectedImage ? null : undefined),
      };

      console.log('salaData preparado:', salaData);
      console.log('Tipo da imagem:', typeof salaData.imagem);
      console.log('Valor da imagem:', salaData.imagem);

      let result;
      if (isEditing && sala) {
        console.log('Chamando updateSala...');
        result = await updateSala(sala.qr_code_id, salaData as UpdateSalaData);
        
      } else {
        console.log('Chamando createSala...');
        result = await createSala(salaData as CreateSalaData);
        
      }
      
      console.log('Resultado da operação:', result);

      if (result.success) {
        Alert.alert(
          'Sucesso',
          isEditing ? 'Sala atualizada com sucesso!' : 'Sala criada com sucesso!'
        );
        onClose();
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar sala');
      }
    } catch (error) {
      console.error('Form submit error:', error);
      Alert.alert('Erro', 'Erro inesperado ao salvar sala');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = `border border-gray-300 rounded-xl px-4 py-3 text-base ${
    isDarkMode 
      ? 'bg-gray-700 border-gray-600 text-white' 
      : 'bg-white border-gray-300 text-gray-900'
  }`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
 
        <View className={`flex-row items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <Text className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {isEditing ? 'Editar Sala' : 'Nova Sala'}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 rounded-full"
            style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
          >
            <X size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <View className="space-y-4">

            <View>
              <Text className={`text-base font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Nome/Número da Sala *
              </Text>
              <TextInput
                className={inputStyle}
                placeholder="Ex: Sala 101, Laboratório de Informática"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={formData.nome_numero}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nome_numero: text }))}
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className={`text-base font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Capacidade (pessoas) *
              </Text>
              <TextInput
                className={inputStyle}
                placeholder="Ex: 30"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={formData.capacidade}
                onChangeText={(text) => setFormData(prev => ({ ...prev, capacidade: text }))}
                keyboardType="numeric"
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className={`text-base font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Validade da Limpeza (horas) *
              </Text>
              <TextInput
                className={inputStyle}
                placeholder="Ex: 4"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={formData.validade_limpeza_horas}
                onChangeText={(text) => setFormData(prev => ({ ...prev, validade_limpeza_horas: text }))}
                keyboardType="numeric"
                editable={!isLoading}
              />
              <Text className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Por quantas horas a limpeza será válida
              </Text>
            </View>

            <View>
              <Text className={`text-base font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Localização *
              </Text>
              <TextInput
                className={inputStyle}
                placeholder="Ex: Bloco A, Prédio Principal"
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={formData.localizacao}
                onChangeText={(text) => setFormData(prev => ({ ...prev, localizacao: text }))}
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className={`text-base font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Responsáveis (Zeladores)
              </Text>
              
              <TouchableOpacity
                onPress={() => setShowResponsaveisModal(true)}
                className={`border border-gray-300 rounded-xl px-4 py-3 ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600' 
                    : 'bg-white border-gray-300'
                }`}
              >
                <Text className={`${
                  selectedResponsaveis.length > 0 
                    ? (isDarkMode ? 'text-white' : 'text-gray-900')
                    : (isDarkMode ? 'text-gray-400' : 'text-gray-500')
                }`}>
                  {selectedResponsaveis.length > 0 
                    ? `${selectedResponsaveis.length} zelador(es) selecionado(s)`
                    : 'Selecionar zeladores responsáveis'
                  }
                </Text>
              </TouchableOpacity>
              
              {selectedResponsaveis.length > 0 && (
                <View className="mt-2">
                  {selectedResponsaveis.map((username, index) => (
                    <View key={index} className="flex-row items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg mb-1">
                      <Text className={`text-sm ${
                        isDarkMode ? 'text-blue-200' : 'text-blue-800'
                      }`}>
                        {username}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setSelectedResponsaveis(prev => 
                          prev.filter((_, i) => i !== index)
                        )}
                        className="p-1"
                      >
                        <X size={16} color={isDarkMode ? '#93C5FD' : '#1D4ED8'} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View>
              <Text className={`text-base font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Foto da Sala
              </Text>
              
              <View className={`border-2 border-dashed rounded-xl p-4 ${
                isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
              }`}>
                {selectedImage ? (
                  <View className="relative">
                    <Image
                      source={{ uri: selectedImage }}
                      className="w-full h-48 rounded-lg"
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      onPress={removeImage}
                      className="absolute top-2 right-2 bg-red-500 rounded-full p-1"
                      style={{ width: 28, height: 28 }}
                    >
                      <X size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="items-center py-8">
                    <ImageIcon 
                      size={48} 
                      color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                    />
                    <Text className={`text-sm mt-2 text-center ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Nenhuma foto selecionada
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  onPress={showImageOptions}
                  disabled={isImageLoading}
                  className={`mt-3 flex-row items-center justify-center py-3 px-4 rounded-lg ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                  }`}
                  style={{ opacity: isImageLoading ? 0.6 : 1 }}
                >
                  {isImageLoading ? (
                    <ActivityIndicator size={16} color="white" />
                  ) : (
                    <Camera size={16} color="white" />
                  )}
                  <Text className="ml-2 text-white text-sm font-medium">
                    {isImageLoading ? 'Carregando...' : (selectedImage ? 'Alterar Foto' : 'Adicionar Foto')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className={`text-base font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Descrição
              </Text>
              <TextInput
                className={`${inputStyle} h-24`}
                placeholder="Descreva as principais atividades realizadas na sala..."
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={formData.descricao}
                onChangeText={(text) => setFormData(prev => ({ ...prev, descricao: text }))}
                multiline
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>

            <View>
              <Text className={`text-base font-semibold mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Instruções de Limpeza
              </Text>
              <TextInput
                className={`${inputStyle} h-24`}
                placeholder="Instruções específicas para a equipe de zeladoria..."
                placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                value={formData.instrucoes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, instrucoes: text }))}
                multiline
                textAlignVertical="top"
                editable={!isLoading}
              />
            </View>

            <Text className={`text-sm mt-4 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              * Campos obrigatórios
            </Text>
          </View>
        </ScrollView>

        <View className={`p-4 border-t ${
          isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            className={`flex-row items-center justify-center py-3 px-6 rounded-xl ${
              isLoading ? 'opacity-60' : 'opacity-100'
            }`}
            style={{ backgroundColor: SENAC_COLORS.primary }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Save size={20} color="white" />
                <Text className="text-white text-lg font-semibold ml-2">
                  {isEditing ? 'Atualizar Sala' : 'Criar Sala'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showResponsaveisModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowResponsaveisModal(false)}
      >
        <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <View className={`flex-row items-center justify-between p-4 border-b ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <Text className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Selecionar Zeladores
            </Text>
            <TouchableOpacity
              onPress={() => setShowResponsaveisModal(false)}
              className="p-2 rounded-full"
              style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
            >
              <X size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            {zeladores.length > 0 ? (
              zeladores.map((zelador) => (
                <TouchableOpacity
                  key={zelador.id}
                  onPress={() => {
                    if (selectedResponsaveis.includes(zelador.username)) {
                      setSelectedResponsaveis(prev => 
                        prev.filter(username => username !== zelador.username)
                      );
                    } else {
                      setSelectedResponsaveis(prev => [...prev, zelador.username]);
                    }
                  }}
                  className={`p-4 rounded-xl mb-2 border ${
                    selectedResponsaveis.includes(zelador.username)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : (isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white')
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={`text-lg font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {zelador.username}
                      </Text>
                      <Text className={`text-sm ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {zelador.email || 'Sem email'}
                      </Text>
                    </View>
                    {selectedResponsaveis.includes(zelador.username) && (
                      <View className="w-6 h-6 bg-blue-500 rounded-full items-center justify-center">
                        <X size={16} color="white" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text className={`text-center py-8 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Nenhum zelador encontrado
              </Text>
            )}
          </ScrollView>

          <View className={`p-4 border-t ${
            isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <TouchableOpacity
              onPress={() => setShowResponsaveisModal(false)}
              className="flex-row items-center justify-center py-3 px-6 rounded-xl"
              style={{ backgroundColor: SENAC_COLORS.primary }}
            >
              <Text className="text-white text-lg font-semibold">
                Confirmar Seleção
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default SalaForm;

