import React from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { Sala } from '../types/salas';

interface MarcarSujaModalProps {
  visible: boolean;
  sala: Sala | null;
  observacao: string;
  onObservacaoChange: (text: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const MarcarSujaModal: React.FC<MarcarSujaModalProps> = ({
  visible,
  sala,
  observacao,
  onObservacaoChange,
  onConfirm,
  onCancel,
}) => {
  const { isDarkMode } = useAuth();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className={`w-full max-w-md rounded-2xl p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <Text className={`text-xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Marcar Sala como Suja
          </Text>
          
          <Text className={`text-base mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Sala: {sala?.nome_numero}
          </Text>
          
          <Text className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Adicione uma observação (opcional) sobre o motivo da solicitação:
          </Text>
          
          <TextInput
            value={observacao}
            onChangeText={onObservacaoChange}
            placeholder="Ex: Material derramado no chão, banheiro entupido, etc."
            placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
            multiline={true}
            numberOfLines={4}
            className={`w-full p-3 rounded-xl border text-base ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
            style={{
              textAlignVertical: 'top',
            }}
          />
          
          <View className="flex-row justify-end mt-6" style={{ gap: 30 }}>
            <TouchableOpacity
              onPress={onCancel}
              className="px-6 py-3 rounded-xl"
              style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
            >
              <Text className={`font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Cancelar
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={onConfirm}
              className="px-6 py-3 rounded-xl"
              style={{ backgroundColor: '#F59E0B' }}
            >
              <Text className="font-medium text-white">
                Marcar como Suja
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default MarcarSujaModal;
