import React from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Users, CheckCircle, Clock, Trash2, Edit, BrushCleaning } from 'lucide-react-native';
import { Sala } from '../types/salas';
import { useAuth } from '../contexts/AuthContext';
import { useSalas } from '../contexts/SalasContext';
import { SENAC_COLORS } from '../constants/colors';

interface SalaCardProps {
  sala: Sala;
  onEdit?: (sala: Sala) => void;
  navigation?: any;
}

const SalaCard: React.FC<SalaCardProps> = ({ sala, onEdit, navigation }) => {
  const { isDarkMode, user } = useAuth();
  const { marcarComoLimpa, deleteSala } = useSalas();

  const displayLastCleanedTime = (utcDateTimeString: string | null): string => {
    if (!utcDateTimeString) {
      return "Nunca foi limpa";
    }

    try {
      const dateObjectUTC = parseISO(utcDateTimeString);
      return format(dateObjectUTC, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao processar data/hora:", error);
      return "Data Inválida";
    }
  };

  const handleMarcarLimpa = () => {
    if (navigation) {
      navigation.navigate('LimpezaProcesso', { 
        salaId: sala.id, 
        salaNome: sala.nome_numero 
      });
    }
  };

  const handleDelete = () => {
    if (!user?.is_staff && !user?.is_superuser) {
      Alert.alert('Erro', 'Apenas administradores podem excluir salas');
      return;
    }

    Alert.alert(
      'Excluir Sala',
      `Tem certeza que deseja excluir a ${sala.nome_numero}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteSala(Number(sala.id));
            if (result.success) {
              Alert.alert('Sucesso', 'Sala excluída com sucesso!');
            } else {
              Alert.alert('Erro', result.error || 'Erro ao excluir sala');
            }
          }
        }
      ]
    );
  };

  const handleCardPress = () => {
    if (navigation) {
      navigation.navigate('RegistrosLimpeza', { salaId: sala.id, salaNome: sala.nome_numero });
    }
  };

  const isLimpa = sala.status_limpeza === 'Limpa';
  const statusColor = isLimpa ? '#10B981' : '#F59E0B';
  const statusIcon = isLimpa ? CheckCircle : Clock;
  const StatusIcon = statusIcon;

  return (
    <TouchableOpacity 
      onPress={handleCardPress}
      activeOpacity={0.7}
      className={`mx-4 mb-4 p-4 rounded-2xl ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-sm border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className={`text-lg font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            {sala.nome_numero}
          </Text>
          <View className="flex-row items-center mt-1">
            <View 
              className="flex-row items-center px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: isDarkMode 
                  ? statusColor + '20' 
                  : statusColor + '15' 
              }}
            >
              <StatusIcon size={16} color={statusColor} />
              <Text 
                className="ml-2 text-sm font-medium"
                style={{ color: statusColor }}
              >
                {sala.status_limpeza}
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row space-x-2 gap-2">
          {!isLimpa && (
            <TouchableOpacity
              onPress={handleMarcarLimpa}
              className="p-2 rounded-full"
              style={{ backgroundColor: isDarkMode ? '#10B981' + '20' : '#10B981' + '20' }}
            >
              <BrushCleaning size={20} color={isDarkMode ? '#10B981' : '#10B981'} />
            </TouchableOpacity>
          )}
          
          {(user?.is_staff || user?.is_superuser) && onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(sala)}
              className="p-2 rounded-full"
              style={{ backgroundColor: '#3B82F6' + '20' }}
            >
              <Edit size={20} color="#3B82F6" />
            </TouchableOpacity>
          )}
          
          {(user?.is_staff || user?.is_superuser) && (
            <TouchableOpacity
              onPress={handleDelete}
              className="p-2 rounded-full"
              style={{ backgroundColor: '#EF4444' + '20' }}
            >
              <Trash2 size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="space-y-2">
        <View className="flex-row items-center">
          <Users size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-2 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Capacidade: {sala.capacidade} pessoas
          </Text>
        </View>

        <View className="flex-row items-center">
          <MapPin size={16} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          <Text className={`ml-2 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {sala.localizacao}
          </Text>
        </View>

        {sala.descricao && (
          <Text className={`text-sm mt-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {sala.descricao}
          </Text>
        )}

        <View className={`mt-3 p-3 rounded-xl ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <Text className={`text-xs font-medium ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            ÚLTIMA LIMPEZA
          </Text>
          <Text className={`text-sm mt-1 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            {displayLastCleanedTime(sala.ultima_limpeza_data_hora)}
          </Text>
          {sala.ultima_limpeza_funcionario && (
            <Text className={`text-xs mt-1 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Por: {sala.ultima_limpeza_funcionario}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SalaCard;

