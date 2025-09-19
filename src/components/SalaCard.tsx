import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, Modal, TextInput } from 'react-native';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Users, CheckCircle, Clock, Trash2, Edit, BrushCleaning, FileInput } from 'lucide-react-native';
import { Sala } from '../types/salas';
import { useAuth, canViewLimpezaHistory } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupsContext';
import { useSalas } from '../contexts/SalasContext';
import { SENAC_COLORS } from '../constants/colors';

interface SalaCardProps {
  sala: Sala;
  onEdit?: (sala: Sala) => void;
  navigation?: any;
}

const SalaCard: React.FC<SalaCardProps> = ({ sala, onEdit, navigation }) => {
  const { isDarkMode, user } = useAuth();
  const { groups, getGroupName } = useGroups();
  const { marcarComoLimpa, deleteSala, marcarComoSuja } = useSalas();
  const [imageLoadError, setImageLoadError] = useState(false);
  const [showObservacaoModal, setShowObservacaoModal] = useState(false);
  const [observacao, setObservacao] = useState('');

  const isZelador = (user: any, groups: any[]): boolean => {
    if (!user?.groups || !groups.length) return false;
    return user.groups.some((groupId: number) => {
      const groupName = getGroupName(groupId);
      return groupName === 'Zeladoria';
    });
  };

  const isSolicitanteServico = (user: any, groups: any[]): boolean => {
    if (!user?.groups || !groups.length) return false;
    return user.groups.some((groupId: number) => {
      const groupName = getGroupName(groupId);
      return groupName === 'Solicitante de Serviços';
    });
  };

  const getImageUrl = (imageUrl: string | null | undefined): string | null => {
    
    if (!imageUrl || imageUrl.trim() === '') {
      return null;
    }
    
    if (imageUrl.includes('10.1.1.210')) {
      const correctedUrl = imageUrl.replace('http://10.1.1.210', 'https://zeladoria.tsr.net.br');
      return correctedUrl;
    }
    
    if (imageUrl.startsWith('https://zeladoria.tsr.net.br')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('/')) {
      const fullUrl = `https://zeladoria.tsr.net.br${imageUrl}`;
      return fullUrl;
    }
    
    const fullUrl = `https://zeladoria.tsr.net.br/${imageUrl}`;
    return fullUrl;
  };

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
        salaId: sala.qr_code_id, 
        salaNome: sala.nome_numero 
      });
    }
  };

  const handleDelete = () => {
    if (!user?.is_superuser) {
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
            const result = await deleteSala(sala.qr_code_id);
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

  const handleMarcarSuja = () => {
    setObservacao('');
    setShowObservacaoModal(true);
  };

  const handleConfirmarMarcarSuja = async () => {
    const data = observacao.trim() ? { observacoes: observacao.trim() } : undefined;
    const result = await marcarComoSuja(sala.qr_code_id, data);
    
    setShowObservacaoModal(false);
    setObservacao('');
    
    if (result.success) {
      Alert.alert('Sucesso', 'Sala marcada como suja!');
    } else {
      Alert.alert('Erro', result.error || 'Erro ao marcar sala como suja');
    }
  };

  const handleCancelarMarcarSuja = () => {
    setShowObservacaoModal(false);
    setObservacao('');
  };

  const handleCardPress = () => {
    if (navigation && canViewLimpezaHistory(user)) {
      navigation.navigate('RegistrosLimpeza', { salaId: sala.id, salaNome: sala.nome_numero });
    }
  };

  const isLimpa = sala.status_limpeza === 'Limpa';
  const isEmLimpeza = sala.status_limpeza === 'Em Limpeza';
  const isSuja = sala.status_limpeza === 'Suja';
  
  let statusColor = '#F59E0B'; // Default: Limpeza Pendente
  let statusIcon = Clock;
  
  if (isLimpa) {
    statusColor = '#10B981';
    statusIcon = CheckCircle;
  } else if (isEmLimpeza) {
    statusColor = '#3B82F6';
    statusIcon = Clock;
  } else if (isSuja) {
    statusColor = '#EF4444';
    statusIcon = Trash2;
  }
  
  const StatusIcon = statusIcon;

  const imageUrl = getImageUrl(sala.imagem);

  return (
    <>
      <TouchableOpacity 
        onPress={handleCardPress}
        activeOpacity={0.7}
        className={`mx-4 mb-4 rounded-2xl overflow-hidden shadow-sm border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
        style={{
          backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        }}
      >
      {imageUrl && !imageLoadError && (
        <Image
          source={{ uri: imageUrl }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
          onError={(error) => {
            console.log('=== IMAGE ERROR DEBUG ===');
            console.log('Erro ao carregar imagem de fundo da sala:', error);
            console.log('URL que causou erro:', imageUrl);
            console.log('sala.imagem original:', sala.imagem);
            setImageLoadError(true);
          }}
          onLoad={() => {
            console.log('=== IMAGE LOAD SUCCESS ===');
            console.log('Imagem de fundo carregada com sucesso:', imageUrl);
            setImageLoadError(false);
          }}
        />
      )}
      
      <View 
        className="absolute inset-0"
        style={{
          backgroundColor: isDarkMode 
            ? 'rgba(0, 0, 0, 0.6)' 
            : 'rgba(255, 255, 255, 0.5)'
        }}
      />
      
      <View className="relative p-4">
        <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className={`text-lg font-bold ${
                isDarkMode 
                  ? 'text-white' 
                  : 'text-gray-900'
              }`}
                style={isDarkMode ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
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
                    className={`ml-2 text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}
                    style={{ 
                      color: statusColor,
                      ...(isDarkMode ? {
                        textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                        textShadowOffset: { width: 1, height: 1 }, 
                        textShadowRadius: 2 
                      } : {})
                    }}
                  >
                    {sala.status_limpeza}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row space-x-2 gap-2">
              {isZelador(user, groups) && !isLimpa && !isEmLimpeza && (
                <TouchableOpacity
                  onPress={handleMarcarLimpa}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: isDarkMode ? '#10B981' + '20' : '#10B981' + '20' }}
                >
                  <BrushCleaning size={20} color="#10B981" />
                </TouchableOpacity>
              )}
              
              {isSolicitanteServico(user, groups) && !isSuja && (
                <TouchableOpacity
                  onPress={handleMarcarSuja}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: '#F59E0B' + '20' }}
                >
                  <FileInput size={20} color="#F59E0B" />
                </TouchableOpacity>
              )}
              
              {user?.is_superuser && onEdit && (
                <TouchableOpacity
                  onPress={() => onEdit(sala)}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: '#3B82F6' + '20' }}
                >
                  <Edit size={20} color="#3B82F6" />
                </TouchableOpacity>
              )}
              
              {user?.is_superuser && (
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
              <Users size={16} color={isDarkMode ? "rgba(255, 255, 255, 0.9)" : "#6B7280"} />
              <Text className={`ml-2 text-sm ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}
                style={isDarkMode ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
                Capacidade: {sala.capacidade} pessoas
              </Text>
            </View>

            <View className="flex-row items-center">
              <MapPin size={16} color={isDarkMode ? "rgba(255, 255, 255, 0.9)" : "#6B7280"} />
              <Text className={`ml-2 text-sm ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}
                style={isDarkMode ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
                {sala.localizacao}
              </Text>
            </View>

            {sala.descricao && (
              <Text className={`text-sm mt-2 ${
                isDarkMode ? 'text-white' : 'text-gray-700'
              }`}
                style={isDarkMode ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
                {sala.descricao}
              </Text>
            )}

            <View className={`mt-3 p-3 rounded-xl ${
              isDarkMode ? 'bg-black/30' : 'bg-white/20'
            }`}>
              <Text className={`text-xs font-medium ${
                isDarkMode ? 'text-white/80' : 'text-gray-600'
              }`}
                style={isDarkMode ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
                ÚLTIMA LIMPEZA
              </Text>
              <Text className={`text-sm mt-1 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}
                style={isDarkMode ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
                {displayLastCleanedTime(sala.ultima_limpeza_data_hora)}
              </Text>
              {sala.ultima_limpeza_funcionario && (
                <Text className={`text-xs mt-1 ${
                  isDarkMode ? 'text-white/80' : 'text-gray-600'
                }`}
                  style={isDarkMode ? { 
                    textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                    textShadowOffset: { width: 1, height: 1 }, 
                    textShadowRadius: 2 
                  } : {}}
                >
                  Por: {sala.ultima_limpeza_funcionario}
                </Text>
              )}
            </View>
          </View>
      </View>
    </TouchableOpacity>

    <Modal
      visible={showObservacaoModal}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancelarMarcarSuja}
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
            Sala: {sala.nome_numero}
          </Text>
          
          <Text className={`text-sm mb-4 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Adicione uma observação (opcional) sobre o motivo da solicitação:
          </Text>
          
          <TextInput
            value={observacao}
            onChangeText={setObservacao}
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
          
          <View className="flex-row justify-end space-x-3 mt-6">
            <TouchableOpacity
              onPress={handleCancelarMarcarSuja}
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
              onPress={handleConfirmarMarcarSuja}
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
    </>
  );
};

export default SalaCard;

