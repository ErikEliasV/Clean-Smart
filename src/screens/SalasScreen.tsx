import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X } from 'lucide-react-native';
import { useAuth, canManageSalas } from '../contexts/AuthContext';
import { useSalas } from '../contexts/SalasContext';
import { Sala } from '../types/salas';
import SalaCard from '../components/SalaCard';
import SalaForm from '../components/SalaForm';
import { SENAC_COLORS } from '../constants/colors';

interface SalasScreenProps {
  navigation: any;
}

const SalasScreen: React.FC<SalasScreenProps> = ({ navigation }) => {
  const { isDarkMode, user } = useAuth();
  const { salas, isLoading, listSalas } = useSalas();
  const [showForm, setShowForm] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'limpa' | 'pendente'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSalas();
  }, []);

  const loadSalas = async () => {
    await listSalas();
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSalas();
    setRefreshing(false);
  }, []);

  const handleAddSala = () => {
    if (!canManageSalas(user)) {
      return;
    }
    setEditingSala(undefined);
    setShowForm(true);
  };

  const handleEditSala = (sala: Sala) => {
    setEditingSala(sala);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSala(undefined);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredSalas = salas.filter(sala => {
    let statusMatch = true;
    if (filterStatus === 'limpa') statusMatch = sala.status_limpeza === 'Limpa';
    if (filterStatus === 'pendente') statusMatch = sala.status_limpeza === 'Limpeza Pendente';

    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      searchMatch =
        sala.nome_numero.toLowerCase().includes(query) ||
        sala.descricao?.toLowerCase().includes(query) ||
        sala.localizacao.toLowerCase().includes(query) ||
        sala.capacidade.toString().includes(query);
    }

    return statusMatch && searchMatch;
  });

  const getStatusCounts = () => {
    const limpa = salas.filter(s => s.status_limpeza === 'Limpa').length;
    const pendente = salas.filter(s => s.status_limpeza === 'Limpeza Pendente').length;
    return { limpa, pendente, total: salas.length };
  };

  const statusCounts = getStatusCounts();

  const FilterButton = ({
    status,
    label,
    count
  }: {
    status: typeof filterStatus,
    label: string,
    count: number
  }) => {
    const isActive = filterStatus === status;
    return (
      <TouchableOpacity
        onPress={() => setFilterStatus(status)}
        className={`px-4 py-2 rounded-full mr-3 ${isActive
            ? 'opacity-100'
            : 'opacity-70'
          }`}
        style={{
          backgroundColor: isActive
            ? SENAC_COLORS.primary
            : (isDarkMode ? '#374151' : '#F3F4F6')
        }}
      >
        <Text className={`text-sm font-medium ${isActive
            ? 'text-white'
            : (isDarkMode ? 'text-gray-300' : 'text-gray-700')
          }`}>
          {label} ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSala = ({ item }: { item: Sala }) => (
    <SalaCard
      sala={item}
      onEdit={handleEditSala}
      navigation={navigation}
    />
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-12">
      <Text className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
        {searchQuery.trim()
          ? 'Nenhuma sala encontrada'
          : filterStatus === 'all'
            ? 'Nenhuma sala cadastrada'
            : `Nenhuma sala ${filterStatus === 'limpa' ? 'limpa' : 'pendente'}`
        }
      </Text>
      <Text className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
        {searchQuery.trim()
          ? 'Tente uma pesquisa diferente ou limpe o filtro'
          : filterStatus === 'all' && canManageSalas(user)
            ? 'Toque no botão + para adicionar uma nova sala'
            : filterStatus !== 'all'
              ? 'Tente alterar o filtro para ver outras salas'
              : 'Entre em contato com um administrador para adicionar salas'
        }
      </Text>
    </View>
  );

  if (isLoading && salas.length === 0) {
    return (
      <View className={`flex-1 items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
        <ActivityIndicator size="large" color={SENAC_COLORS.primary} />
        <Text className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
          Carregando salas...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className={`px-4 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">

            <Image source={require('../../assets/images/logo_invert.png')} className="w-16 h-12 mr-4" />
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
              Salas
            </Text>
          </View>

          {canManageSalas(user) && (
            <TouchableOpacity
              onPress={handleAddSala}
              className="p-2 rounded-full"
              style={{ backgroundColor: SENAC_COLORS.primary }}
            >
              <Plus size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Barra de Pesquisa */}
        <View className="mb-4">
          <View className="relative">
            <TextInput
              className={`border rounded-xl px-4 py-3 pr-12 text-base ${isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
              placeholder="Pesquisar salas por nome, descrição, localização..."
              placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={clearSearch}
                className="absolute right-3 top-3 p-1"
              >
                <X size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filtros */}
        <View className="flex-row">
          <FilterButton status="all" label="Todas" count={statusCounts.total} />
          <FilterButton status="limpa" label="Limpas" count={statusCounts.limpa} />
          <FilterButton status="pendente" label="Pendentes" count={statusCounts.pendente} />
        </View>

        {/* Contador de resultados quando há pesquisa */}
        {searchQuery.trim() && (
          <View className="mt-3">
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
              {filteredSalas.length} resultado{filteredSalas.length !== 1 ? 's' : ''} para "{searchQuery}"
            </Text>
          </View>
        )}
      </View>

      {/* Lista de salas */}
      <FlatList
        data={filteredSalas}
        renderItem={renderSala}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 120,
          flexGrow: 1
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[SENAC_COLORS.primary]}
            tintColor={SENAC_COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmpty}
      />

      {/* Modal do formulário */}
      <SalaForm
        visible={showForm}
        onClose={handleCloseForm}
        sala={editingSala}
      />
    </SafeAreaView>
  );
};

export default SalasScreen;
