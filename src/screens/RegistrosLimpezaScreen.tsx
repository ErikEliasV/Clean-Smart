import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { parseISO, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, Filter, Calendar, User, MapPin } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSalas } from '../contexts/SalasContext';
import { LimpezaRegistro, Sala } from '../types/salas';
import { SENAC_COLORS } from '../constants/colors';

interface RegistrosLimpezaScreenProps {
  navigation: any;
}

const RegistrosLimpezaScreen: React.FC<RegistrosLimpezaScreenProps> = ({ navigation, route }) => {
  const { isDarkMode, user } = useAuth();
  const { listRegistrosLimpeza, salas } = useSalas();
  const [registros, setRegistros] = useState<LimpezaRegistro[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSalaId, setSelectedSalaId] = useState<number | undefined>(route?.params?.salaId);
  const [showSalaFilter, setShowSalaFilter] = useState(false);

  const loadRegistros = async (salaId?: number) => {
    if (!user?.is_staff && !user?.is_superuser) {
      Alert.alert('Erro', 'Apenas administradores podem acessar os registros de limpeza');
      navigation.goBack();
      return;
    }

    setIsLoading(true);
    try {
      const result = await listRegistrosLimpeza(salaId);
      if (result.success && result.registros) {
        setRegistros(result.registros);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar registros');
      }
    } catch (error) {
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

  const formatDateTime = (dateTimeString: string): string => {
    try {
      const dateObject = parseISO(dateTimeString);
      return format(dateObject, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data Inválida";
    }
  };

  const getSalaNome = (salaId: number): string => {
    const sala = salas.find(s => s.id === salaId);
    return sala ? sala.nome_numero : `Sala ${salaId}`;
  };

  const renderRegistro = ({ item }: { item: LimpezaRegistro }) => (
    <View className={`mx-4 mb-3 p-4 rounded-xl ${
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
          
          <View className="flex-row items-center mb-1">
            <Calendar size={16} color={SENAC_COLORS.primary} />
            <Text className={`ml-2 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {formatDateTime(item.data_hora_limpeza)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <User size={16} color={SENAC_COLORS.primary} />
            <Text className={`ml-2 text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              {item.funcionario_responsavel.username}
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
    <View className={`flex-1 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Header */}
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

      {/* Filtro de Sala */}
      {showSalaFilter && renderSalaFilter()}

      {/* Lista de Registros */}
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
    </View>
  );
};

export default RegistrosLimpezaScreen;
