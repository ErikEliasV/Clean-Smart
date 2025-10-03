import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Brush, AlertTriangle, Settings } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { Sala } from '../types/salas';

interface ActionSelectionModalProps {
  visible: boolean;
  sala: Sala | null;
  actions: string[];
  onActionSelect: (action: string) => void;
  onCancel: () => void;
}

const ActionSelectionModal: React.FC<ActionSelectionModalProps> = ({
  visible,
  sala,
  actions,
  onActionSelect,
  onCancel,
}) => {
  const { isDarkMode } = useAuth();

  const getActionConfig = (action: string) => {
    switch (action) {
      case 'zelador':
        return {
          icon: Brush,
          title: 'Limpar Sala',
          description: 'Iniciar processo de limpeza',
          colors: {
            bg: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50',
            border: isDarkMode ? 'border-blue-700' : 'border-blue-200',
            text: isDarkMode ? 'text-blue-200' : 'text-blue-800',
            textSecondary: isDarkMode ? 'text-blue-300' : 'text-blue-600',
            iconBg: isDarkMode ? '#1E40AF' : '#3B82F6'
          }
        };
      case 'solicitante':
        return {
          icon: AlertTriangle,
          title: 'Marcar como Suja',
          description: 'Informar que a sala precisa de limpeza',
          colors: {
            bg: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50',
            border: isDarkMode ? 'border-orange-700' : 'border-orange-200',
            text: isDarkMode ? 'text-orange-200' : 'text-orange-800',
            textSecondary: isDarkMode ? 'text-orange-300' : 'text-orange-600',
            iconBg: isDarkMode ? '#C2410C' : '#F59E0B'
          }
        };
      case 'administrador':
        return {
          icon: Settings,
          title: 'Editar Sala',
          description: 'Gerenciar informações da sala',
          colors: {
            bg: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50',
            border: isDarkMode ? 'border-purple-700' : 'border-purple-200',
            text: isDarkMode ? 'text-purple-200' : 'text-purple-800',
            textSecondary: isDarkMode ? 'text-purple-300' : 'text-purple-600',
            iconBg: isDarkMode ? '#7C3AED' : '#8B5CF6'
          }
        };
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View className="flex-1 bg-black/50 justify-center items-center px-6">
        <View className={`w-full max-w-md rounded-2xl p-6 ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        }`}>
          <View className="items-center mb-6">
            <Text className={`text-xl font-bold text-center ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              O que você deseja fazer?
            </Text>
            <Text className={`text-sm text-center mt-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Sala: {sala?.nome_numero}
            </Text>
          </View>

          <View className="space-y-3">
            {actions.map((action) => {
              const config = getActionConfig(action);
              if (!config) return null;

              const IconComponent = config.icon;

              return (
                <TouchableOpacity
                  key={action}
                  onPress={() => onActionSelect(action)}
                  className={`p-4 rounded-xl border-2 ${config.colors.bg} ${config.colors.border}`}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: config.colors.iconBg }}>
                      <IconComponent size={20} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-lg font-semibold ${config.colors.text}`}>
                        {config.title}
                      </Text>
                      <Text className={`text-sm mt-1 ${config.colors.textSecondary}`}>
                        {config.description}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            onPress={onCancel}
            className="mt-4 p-4 rounded-xl"
            style={{ backgroundColor: isDarkMode ? '#374151' : '#E5E7EB' }}
          >
            <Text className={`text-center font-semibold ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Cancelar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ActionSelectionModal;
