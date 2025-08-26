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
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import { Sala, CreateSalaData, UpdateSalaData } from '../types/salas';
import { useAuth } from '../contexts/AuthContext';
import { useSalas } from '../contexts/SalasContext';
import { SENAC_COLORS } from '../constants/colors';

interface SalaFormProps {
  visible: boolean;
  onClose: () => void;
  sala?: Sala;
}

const SalaForm: React.FC<SalaFormProps> = ({ visible, onClose, sala }) => {
  const { isDarkMode, user } = useAuth();
  const { createSala, updateSala } = useSalas();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nome_numero: '',
    capacidade: '',
    descricao: '',
    localizacao: '',
  });

  const isEditing = !!sala;

  useEffect(() => {
    if (sala) {
      setFormData({
        nome_numero: sala.nome_numero,
        capacidade: sala.capacidade.toString(),
        descricao: sala.descricao,
        localizacao: sala.localizacao,
      });
    } else {
      setFormData({
        nome_numero: '',
        capacidade: '',
        descricao: '',
        localizacao: '',
      });
    }
  }, [sala, visible]);

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
    if (!formData.descricao.trim()) {
      Alert.alert('Erro', 'Descrição é obrigatória');
      return false;
    }
    if (!formData.localizacao.trim()) {
      Alert.alert('Erro', 'Localização é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.is_staff && !user?.is_superuser) {
      Alert.alert('Erro', 'Apenas administradores podem criar/editar salas');
      return;
    }

    setIsLoading(true);

    try {
      const salaData = {
        nome_numero: formData.nome_numero.trim(),
        capacidade: parseInt(formData.capacidade),
        descricao: formData.descricao.trim(),
        localizacao: formData.localizacao.trim(),
      };

      let result;
      if (isEditing && sala) {
        result = await updateSala(sala.id, salaData as UpdateSalaData);
      } else {
        result = await createSala(salaData as CreateSalaData);
      }

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
                Descrição *
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
    </Modal>
  );
};

export default SalaForm;

