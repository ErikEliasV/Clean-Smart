import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Users, CheckCircle, Clock, Trash2, Edit, BrushCleaning, FileInput } from 'lucide-react-native';
import { Sala } from '../schemas';
import { useAuth, canViewLimpezaHistory } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupsContext';
import { useSalas } from '../contexts/SalasContext';
import MarcarSujaModal from './MarcarSujaModal';
import { SENAC_COLORS } from '../constants/colors';
import CustomAlert from './CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

interface SalaCardProps {
  sala: Sala;
  onEdit?: (sala: Sala) => void;
  navigation?: any;
}

const SalaCard: React.FC<SalaCardProps> = ({ sala, onEdit, navigation }) => {
  const { isDarkMode, user } = useAuth();
  const { groups, getGroupName } = useGroups();
  const { marcarComoLimpa, deleteSala, marcarComoSuja, getSala } = useSalas();
  const { alertVisible, alertOptions, showAlert, hideAlert } = useCustomAlert();
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
    const defaultImageUrl = 'https://plus.unsplash.com/premium_photo-1680807869780-e0876a6f3cd5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2FsYSUyMGRlJTIwYXVsYXxlbnwwfHwwfHx8MA%3D%3D';
    
    if (!imageUrl || imageUrl.trim() === '') {
      return defaultImageUrl;
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

  const handleMarcarLimpa = async () => {
    if (navigation) {
      try {
        const result = await getSala(sala.qr_code_id);
        
        if (result.success && result.sala) {
          navigation.navigate('LimpezaProcesso', {
            salaId: result.sala.qr_code_id,
            salaNome: result.sala.nome_numero,
            qrCodeScanned: true
          });
        } else {
          navigation.navigate('LimpezaProcesso', {
            salaId: sala.qr_code_id,
            salaNome: sala.nome_numero,
            qrCodeScanned: true
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados da sala:', error);
        navigation.navigate('LimpezaProcesso', {
          salaId: sala.qr_code_id,
          salaNome: sala.nome_numero,
          qrCodeScanned: true
        });
      }
    }
  };

  const handleDelete = () => {
    if (!user?.is_superuser) {
      showAlert({
        title: 'Erro',
        message: 'Apenas administradores podem excluir salas',
        type: 'error',
        confirmText: 'OK'
      });
      return;
    }

    showAlert({
      title: 'Excluir Sala',
      message: `Tem certeza que deseja excluir a ${sala.nome_numero}?`,
      type: 'warning',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: async () => {
        const result = await deleteSala(sala.qr_code_id);
        if (result.success) {
          showAlert({
            title: 'Sucesso',
            message: 'Sala excluída com sucesso!',
            type: 'success',
            confirmText: 'OK'
          });
        } else {
          showAlert({
            title: 'Erro',
            message: result.error || 'Erro ao excluir sala',
            type: 'error',
            confirmText: 'OK'
          });
        }
      }
    });
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
      showAlert({
        title: 'Sucesso',
        message: 'Sala marcada como suja!',
        type: 'success',
        confirmText: 'OK'
      });
    } else {
      showAlert({
        title: 'Erro',
        message: result.error || 'Erro ao marcar sala como suja',
        type: 'error',
        confirmText: 'OK'
      });
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
  const isInativa = !sala.ativa;
  
  let statusColor = '#F59E0B'; 
  let statusBackgroundColor = '#B45309'; // orange-700
  let statusIcon = Clock;
  
  if (isInativa) {
    statusColor = '#6B7280';
    statusBackgroundColor = '#374151'; // gray-700
    statusIcon = Clock;
  } else if (isLimpa) {
    statusColor = '#10B981';
    statusBackgroundColor = '#065F46'; // green-700
    statusIcon = CheckCircle;
  } else if (isEmLimpeza) {
    statusColor = '#3B82F6';
    statusBackgroundColor = '#1D4ED8'; // blue-700
    statusIcon = Clock;
  } else if (isSuja) {
    statusColor = '#EF4444';
    statusBackgroundColor = '#B91C1C'; // red-700
    statusIcon = Trash2;
  }
  
  const StatusIcon = statusIcon;

  const imageUrl = getImageUrl(sala.imagem);
  const hasCustomImage = sala.imagem && sala.imagem.trim() !== '';

  return (
    <>
      <TouchableOpacity 
        onPress={handleCardPress}
        activeOpacity={0.7}
        className={`mx-4 mb-4 rounded-2xl overflow-hidden border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
        style={{
          backgroundColor: isInativa 
            ? (isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(243, 244, 246, 0.9)')
            : (isDarkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.9)'),
          opacity: isInativa ? 0.6 : 1,
        }}
      >
      {imageUrl && !imageLoadError && (
        <Image
          source={{ uri: imageUrl }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
          
          onLoad={() => {
            console.log('=== IMAGE LOAD SUCCESS ===');
            console.log('Imagem de fundo carregada com sucesso:', imageUrl);
            console.log('É imagem customizada da sala?', hasCustomImage);
            setImageLoadError(false);
          }}
          
          onError={() => {
            console.log('=== IMAGE LOAD ERROR ===');
            console.log('Erro ao carregar imagem:', imageUrl);
            setImageLoadError(true);
          }}
        />
      )}
      
      <View 
        className="absolute inset-0"
        style={{
          backgroundColor: imageUrl && !imageLoadError 
            ? (isDarkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0.2)')  // Overlay quando há imagem (custom ou padrão)
            : isInativa 
              ? 'rgba(255, 255, 255, 1)'  
              : 'rgba(0, 0, 0, 0)'  // Sem overlay quando há erro de carregamento
        }}
      />
      
      <View className="relative p-4">
        <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1">
              <Text className={`text-lg font-bold ${
                isDarkMode 
                  ? 'text-white' 
                  : (imageUrl && !imageLoadError) ? 'text-white' : 'text-gray-900'
              }`}
                style={
                  (isDarkMode || (imageUrl && !imageLoadError)) ? { 
                    textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                    textShadowOffset: { width: 1, height: 1 }, 
                    textShadowRadius: 2 
                  } : {}
                }
              >
                {sala.nome_numero}
              </Text>
              <View className="flex-row items-center mt-1">
                <View 
                  className="flex-row items-center px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: statusBackgroundColor
                  }}
                >
                  <StatusIcon size={16} color={statusColor} />
                  <Text 
                    className="ml-2 text-sm font-medium text-white"
                    style={{
                      textShadowColor: 'rgba(0, 0, 0, 0.5)', 
                      textShadowOffset: { width: 0, height: 1 }, 
                      textShadowRadius: 2 
                    }}
                  >
                    {isInativa ? 'Inativa' : sala.status_limpeza}
                  </Text>
                </View>
              </View>
            </View>
            <View className="flex-row gap-2">
              {!isInativa && isZelador(user, groups) && !isLimpa && !isEmLimpeza && (
                <TouchableOpacity
                  onPress={handleMarcarLimpa}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: '#065F46' }} // green-700
                >
                  <BrushCleaning size={20} color="#10B981" />
                </TouchableOpacity>
              )}
              
              {!isInativa && isSolicitanteServico(user, groups) && !isSuja && (
                <TouchableOpacity
                  onPress={handleMarcarSuja}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: '#B45309' }} // orange-700
                >
                  <FileInput size={20} color="#F59E0B" />
                </TouchableOpacity>
              )}
              
              {user?.is_superuser && onEdit && (
                <TouchableOpacity
                  onPress={() => onEdit(sala)}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: '#1D4ED8' }} // blue-700
                >
                  <Edit size={20} color="#3B82F6" />
                </TouchableOpacity>
              )}
              
              {user?.is_superuser && (
                <TouchableOpacity
                  onPress={handleDelete}
                  className="p-2 rounded-full"
                  style={{ backgroundColor: '#B91C1C' }} // red-700
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="space-y-2">
            <View className="flex-row items-center">
              <Users 
                size={16} 
                color={isDarkMode ? "rgba(255, 255, 255, 0.9)" : 
                       (imageUrl && !imageLoadError) ? "rgba(255, 255, 255, 0.9)" : "#6B7280"} 
              />
              <Text className={`ml-2 text-sm ${
                isDarkMode ? 'text-white' : 
                (imageUrl && !imageLoadError) ? 'text-white' : 'text-gray-700'
              }`}
                style={(isDarkMode || (imageUrl && !imageLoadError)) ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
                Capacidade: {sala.capacidade} pessoas
              </Text>
            </View>

            <View className="flex-row items-center">
              <MapPin 
                size={16} 
                color={isDarkMode ? "rgba(255, 255, 255, 0.9)" : 
                       (imageUrl && !imageLoadError) ? "rgba(255, 255, 255, 0.9)" : "#6B7280"} 
              />
              <Text className={`ml-2 text-sm ${
                isDarkMode ? 'text-white' : 
                (imageUrl && !imageLoadError) ? 'text-white' : 'text-gray-700'
              }`}
                style={(isDarkMode || (imageUrl && !imageLoadError)) ? { 
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
                isDarkMode ? 'text-white' : 
                (imageUrl && !imageLoadError) ? 'text-white' : 'text-gray-700'
              }`}
                style={(isDarkMode || (imageUrl && !imageLoadError)) ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
                {sala.descricao}
              </Text>
            )}

            <View className={`mt-3 p-3 rounded-xl ${
              isDarkMode ? 'bg-black/30' : 
              (imageUrl && !imageLoadError) ? 'bg-black/15' : 'bg-white/20'
            }`}>
              <Text className={`text-xs font-medium ${
                isDarkMode ? 'text-white/80' : 
                (imageUrl && !imageLoadError) ? 'text-white/80' : 'text-gray-600'
              }`}
                style={(isDarkMode || (imageUrl && !imageLoadError)) ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
                ÚLTIMA LIMPEZA
              </Text>
              <Text className={`text-sm mt-1 ${
                isDarkMode ? 'text-white' : 
                (imageUrl && !imageLoadError) ? 'text-white' : 'text-gray-800'
              }`}
                style={(isDarkMode || (imageUrl && !imageLoadError)) ? { 
                  textShadowColor: 'rgba(0, 0, 0, 0.8)', 
                  textShadowOffset: { width: 1, height: 1 }, 
                  textShadowRadius: 2 
                } : {}}
              >
                {displayLastCleanedTime(sala.ultima_limpeza_data_hora)}
              </Text>
              {sala.ultima_limpeza_funcionario && (
                <Text className={`text-xs mt-1 ${
                  isDarkMode ? 'text-white/80' : 
                  (imageUrl && !imageLoadError) ? 'text-white/80' : 'text-gray-600'
                }`}
                  style={(isDarkMode || (imageUrl && !imageLoadError)) ? { 
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

    <MarcarSujaModal
      visible={showObservacaoModal}
      sala={sala}
      observacao={observacao}
      onObservacaoChange={setObservacao}
      onConfirm={handleConfirmarMarcarSuja}
      onCancel={handleCancelarMarcarSuja}
    />

    <CustomAlert
      visible={alertVisible}
      title={alertOptions.title}
      message={alertOptions.message}
      type={alertOptions.type}
      confirmText={alertOptions.confirmText}
      cancelText={alertOptions.cancelText}
      onConfirm={alertOptions.onConfirm}
      onCancel={alertOptions.onCancel}
      showCancel={alertOptions.showCancel}
    />
    </>
  );
};

export default SalaCard;

