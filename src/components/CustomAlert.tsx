import React from 'react';
import { View, Text, TouchableOpacity, Modal, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { SENAC_COLORS } from '../constants/colors';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react-native';

export interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  confirmText = 'OK',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  showCancel = false
}) => {
  const { isDarkMode } = useAuth();

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          color: '#10B981',
          bgColor: '#10B98120'
        };
      case 'error':
        return {
          icon: XCircle,
          color: '#EF4444',
          bgColor: '#EF444420'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          color: '#F59E0B',
          bgColor: '#F59E0B20'
        };
      default:
        return {
          icon: Info,
          color: SENAC_COLORS.primary,
          bgColor: `${SENAC_COLORS.primary}20`
        };
    }
  };

  const { icon: Icon, color, bgColor } = getIconAndColor();

  const handleConfirm = () => {
    onConfirm?.();
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 justify-center items-center bg-black/50 px-6">
        <View className={`w-full max-w-sm rounded-3xl ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-2xl`}>
          {/* Header com ícone */}
          <View className="items-center pt-6 pb-4">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: bgColor }}
            >
              <Icon size={32} color={color} />
            </View>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </Text>
          </View>

          {/* Mensagem */}
          <View className="px-6 pb-6">
            <Text className={`text-base text-center leading-6 ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {message}
            </Text>
          </View>

          {/* Botões */}
          <View className="px-6 pb-6">
            {showCancel ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleCancel}
                  className={`flex-1 py-4 rounded-2xl items-center ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-base font-semibold ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleConfirm}
                  className="flex-1 py-4 rounded-2xl items-center"
                  style={{ backgroundColor: color }}
                  activeOpacity={0.8}
                >
                  <Text className="text-base font-semibold text-white">
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleConfirm}
                className="py-4 rounded-2xl items-center"
                style={{ backgroundColor: color }}
                activeOpacity={0.8}
              >
                <Text className="text-base font-semibold text-white">
                  {confirmText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;
