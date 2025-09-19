import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, Filter, Calendar, User, MapPin, Clock, Camera } from 'lucide-react-native';
import { useAuth, canViewAllSalas } from '../contexts/AuthContext';
import { useSalas } from '../contexts/SalasContext';
import { LimpezaRegistro, Sala } from '../types/salas';
import { SENAC_COLORS } from '../constants/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { SalasStackParamList } from '../types/navigation';

type RegistrosLimpezaScreenProps = StackScreenProps<SalasStackParamList, 'RegistrosLimpeza'>;

const RegistrosLimpezaScreen: React.FC<RegistrosLimpezaScreenProps> = ({ navigation, route }) => {
  const { isDarkMode, user } = useAuth();
  const { listRegistrosLimpeza, salas } = useSalas();
  const [registros, setRegistros] = useState<LimpezaRegistro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSalaId, setSelectedSalaId] = useState<number | undefined>(undefined);
  const [showSalaFilter, setShowSalaFilter] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (route?.params?.salaId && salas.length > 0) {
      setSelectedSalaId(route.params.salaId);
    }
  }, [route?.params?.salaId, salas]);

  const loadRegistros = async (salaId?: number) => {
    if (!canViewAllSalas(user)) {
      Alert.alert('Erro', 'Você não tem permissão para acessar os registros de limpeza');
      navigation.goBack();
      return;
    }

    console.log('=== LOAD REGISTROS DEBUG ===');
    console.log('salaId recebido:', salaId);
    console.log('selectedSalaId:', selectedSalaId);
    console.log('route.params.salaId:', route?.params?.salaId);

    setIsLoading(true);
    try {
      const result = await listRegistrosLimpeza(salaId);
      console.log('Resultado da API:', result);
      if (result.success && result.registros) {
        console.log('Registros carregados:', result.registros.length);
        
        let registrosMapeados = result.registros.map((registro: any) => ({
          ...registro,
          data_hora_limpeza: registro.data_hora_fim || registro.data_hora_inicio,
          funcionario_responsavel: {
            username: registro.funcionario_responsavel || 'Funcionário não informado'
          },
          fotos: registro.fotos || []
        }));
        
        if (salaId) {
          const sala = salas.find(s => s.id === salaId);
          if (sala) {
            registrosMapeados = registrosMapeados.filter((registro: any) => 
              registro.sala === sala.qr_code_id
            );
            console.log(`Filtrados ${registrosMapeados.length} registros para a sala ${sala.nome_numero}`);
          }
        }
        
        console.log('Registros mapeados e filtrados:', registrosMapeados);
        setRegistros(registrosMapeados);
      } else {
        console.log('Erro ao carregar registros:', result.error);
        Alert.alert('Erro', result.error || 'Erro ao carregar registros');
      }
    } catch (error) {
      console.log('Erro na requisição:', error);
      Alert.alert('Erro', 'Erro ao carregar registros de limpeza');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRegistros(selectedSalaId);
    setRefreshing(false);
  };

  useEffect(() => {
    loadRegistros(selectedSalaId);
  }, []);

  useEffect(() => {
    if (selectedSalaId !== undefined) {
      loadRegistros(selectedSalaId);
    }
  }, [selectedSalaId]);

  const formatDateTime = (dateTimeString: string): string => {
    if (!dateTimeString || dateTimeString.trim() === '') {
      return "Data não disponível";
    }
    
    try {
      let dateObject;
      
      dateObject = parseISO(dateTimeString);
      
      if (isNaN(dateObject.getTime())) {
        dateObject = new Date(dateTimeString);
      }
      
      if (isNaN(dateObject.getTime())) {
        return "Data não disponível";
      }
      
      return format(dateObject, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data não disponível";
    }
  };

  const getSalaNome = (salaId: number): string => {
    const sala = salas.find(s => s.id === salaId);
    return sala ? sala.nome_numero : `Sala ${salaId}`;
  };

  const getImageUrl = (imageUrl: string): string => {
    if (imageUrl.includes('10.1.1.210')) {
      return imageUrl.replace('http://10.1.1.210', 'https://zeladoria.tsr.net.br');
    }
    if (imageUrl.startsWith('https://zeladoria.tsr.net.br')) return imageUrl;
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `https://zeladoria.tsr.net.br${imageUrl}`;
    return `https://zeladoria.tsr.net.br/${imageUrl}`;
  };

  const renderRegistro = ({ item }: { item: LimpezaRegistro }) => (
    <View className={`mt-4 mx-4 mb-3 p-4 rounded-xl ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } shadow-sm border ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <MapPin size={16} color={SENAC_COLORS.primary} />
            <Text className={`ml-2 text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {item.sala_nome}
            </Text>
          </View>
          
          {item.data_hora_inicio && (
            <View className="flex-row items-center mb-1">
              <Clock size={16} color={SENAC_COLORS.secondary} />
              <Text className={`ml-2 text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Início: {formatDateTime(item.data_hora_inicio)}
              </Text>
            </View>
          )}
          
          <View className="flex-row items-center mb-1">
            <Calendar size={16} color={SENAC_COLORS.primary} />
            <Text className={`ml-2 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Finalizada: {formatDateTime(item.data_hora_limpeza)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <User size={16} color={SENAC_COLORS.primary} />
            <Text className={`ml-2 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {item.funcionario_responsavel?.username || 'Funcionário não informado'}
            </Text>
          </View>
        </View>
      </View>

      {item.observacoes && (
        <View className={`mt-2 p-2 rounded-lg ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
        }`}>
          <Text className={`text-xs ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Observações:
          </Text>
          <Text className={`text-sm mt-1 ${
            isDarkMode ? 'text-gray-200' : 'text-gray-700'
          }`}>
            {item.observacoes}
          </Text>
        </View>
      )}

      {item.fotos && item.fotos.length > 0 && (
        <View className="mt-3">
          <View className="flex-row items-center mb-2">
            <Camera size={16} color={SENAC_COLORS.primary} />
            <Text className={`ml-2 text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Fotos da Limpeza ({item.fotos.length})
            </Text>
          </View>
          
          <View className="flex-row flex-wrap">
            {item.fotos.map((foto, index) => (
              <TouchableOpacity
                key={foto.id}
                className="mr-2 mb-2"
                onPress={() => setSelectedPhoto(getImageUrl(foto.imagem))}
              >
                <Image
                  source={{ uri: getImageUrl(foto.imagem) }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                />
                {foto.data_hora_upload && (
                  <Text className={`text-xs text-center mt-1 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {formatDateTime(foto.data_hora_upload)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderSalaFilter = () => (
    <View className={`mx-4 mb-4 p-3 rounded-xl ${
      isDarkMode ? 'bg-gray-800' : 'bg-white'
    } border ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <Text className={`text-sm font-medium mb-2 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        Filtrar por Sala:
      </Text>
      <TouchableOpacity
        onPress={() => {
          setSelectedSalaId(undefined);
          setShowSalaFilter(false);
          loadRegistros();
        }}
        className={`p-2 rounded-lg mb-2 ${
          selectedSalaId === undefined
            ? 'bg-blue-100 border border-blue-300'
            : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}
      >
        <Text className={`text-sm ${
          selectedSalaId === undefined
            ? 'text-blue-700 font-medium'
            : isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Todas as Salas
        </Text>
      </TouchableOpacity>
      
      {salas.map((sala) => (
        <TouchableOpacity
          key={sala.id}
          onPress={() => {
            setSelectedSalaId(sala.id);
            setShowSalaFilter(false);
            loadRegistros(sala.id);
          }}
          className={`p-2 rounded-lg mb-1 ${
            selectedSalaId === sala.id
              ? 'bg-blue-100 border border-blue-300'
              : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
          }`}
        >
          <Text className={`text-sm ${
            selectedSalaId === sala.id
              ? 'text-blue-700 font-medium'
              : isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {sala.nome_numero}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`} edges={['top']}>
      <View className={`flex-row items-center justify-between p-4 border-b ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="p-2 rounded-full"
          style={{ backgroundColor: SENAC_COLORS.primary + '20' }}
        >
          <ChevronLeft size={24} color={SENAC_COLORS.primary} />
        </TouchableOpacity>
        
        <Text className={`text-lg font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {selectedSalaId 
            ? `Histórico - ${route?.params?.salaNome || getSalaNome(selectedSalaId)}`
            : 'Registros de Limpeza'
          }
        </Text>
        
        <TouchableOpacity
          onPress={() => setShowSalaFilter(!showSalaFilter)}
          className="p-2 rounded-full"
          style={{ backgroundColor: SENAC_COLORS.primary + '20' }}
        >
          <Filter size={24} color={SENAC_COLORS.primary} />
        </TouchableOpacity>
      </View>

      {showSalaFilter && renderSalaFilter()}

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={SENAC_COLORS.primary} />
          <Text className={`mt-2 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Carregando registros...
          </Text>
        </View>
      ) : (
        <FlatList
          data={registros}
          renderItem={renderRegistro}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[SENAC_COLORS.primary]}
              tintColor={SENAC_COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-8">
              <Text className={`text-lg font-medium ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Nenhum registro encontrado
              </Text>
              <Text className={`text-sm mt-1 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {selectedSalaId 
                  ? `Não há registros de limpeza para ${getSalaNome(selectedSalaId)}`
                  : 'Não há registros de limpeza no sistema'
                }
              </Text>
            </View>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Modal
        visible={selectedPhoto !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedPhoto(null)}
      >
        <View className="flex-1 bg-black/90 justify-center items-center">
          <TouchableOpacity
            className="absolute top-12 right-4 z-10"
            onPress={() => setSelectedPhoto(null)}
          >
            <View className="p-2 rounded-full bg-white/20">
              <Text className="text-white text-lg font-bold">✕</Text>
            </View>
          </TouchableOpacity>
          
          {selectedPhoto && (
            <Image
              source={{ uri: selectedPhoto }}
              className="w-11/12 h-3/4"
              resizeMode="contain"
            />
          )}
          
          <TouchableOpacity
            className="absolute bottom-12"
            onPress={() => setSelectedPhoto(null)}
          >
            <View className="px-6 py-3 rounded-full bg-white/20">
              <Text className="text-white font-medium">Fechar</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RegistrosLimpezaScreen;
