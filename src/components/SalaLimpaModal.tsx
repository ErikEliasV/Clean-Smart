import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SENAC_COLORS } from '../constants/colors';

interface SalaLimpaModalProps {
  visible: boolean;
  salaNome: string | null;
  onClose: () => void;
}

const SalaLimpaModal: React.FC<SalaLimpaModalProps> = ({
  visible,
  salaNome,
  onClose,
}) => {
  const { isDarkMode } = useAuth();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className={`w-full max-w-md rounded-2xl p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <View className="items-center mb-4">
            <View className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: '#10B981' + '20' }}>
              <Text className="text-3xl">✅</Text>
            </View>
            <Text className={`text-xl font-bold text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Sala Já Está Limpa
            </Text>
          </View>
          
          <Text className={`text-base text-center mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            A sala <Text className="font-semibold">{salaNome}</Text> já está limpa.
          </Text>
          
          <Text className={`text-sm text-center mb-6 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Não é possível iniciar um processo de limpeza em uma sala que já está limpa.
          </Text>
          
          <TouchableOpacity
            onPress={onClose}
            className="w-full py-4 rounded-xl"
            style={{ backgroundColor: SENAC_COLORS.primary }}
          >
            <Text className="text-white font-semibold text-center text-base">
              Entendi
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default SalaLimpaModal;
