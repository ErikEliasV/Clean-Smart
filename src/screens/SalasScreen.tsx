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
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, X } from 'lucide-react-native';
import { useAuth, canManageSalas, isAdmin } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupsContext';
import { useSalas } from '../contexts/SalasContext';
import { useQRCode } from '../contexts/QRCodeContext';
import { useLimpeza } from '../contexts/LimpezaContext';
import { Sala } from '../schemas';
import SalaCard from '../components/SalaCard';
import SalaForm from '../components/SalaForm';
import MarcarSujaModal from '../components/MarcarSujaModal';
import SalaLimpaModal from '../components/SalaLimpaModal';
import ActionSelectionModal from '../components/ActionSelectionModal';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { SENAC_COLORS } from '../constants/colors';

interface SalasScreenProps {
  navigation: any;
}

const SalasScreen: React.FC<SalasScreenProps> = ({ navigation }) => {
  const { isDarkMode, user } = useAuth();
  const { groups, getGroupName } = useGroups();
  const { salas, isLoading, listSalas, getSala, marcarComoSuja } = useSalas();
  const { qrCodeData, clearQRCodeData } = useQRCode();
  const { limpezaEmAndamento, dadosLimpeza } = useLimpeza();
  const { alertVisible, alertOptions, showAlert, hideAlert } = useCustomAlert();
  const [showForm, setShowForm] = useState(false);
  const [editingSala, setEditingSala] = useState<Sala | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'limpa' | 'suja' | 'pendente' | 'inativas'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSalaLimpaModal, setShowSalaLimpaModal] = useState(false);
  const [salaLimpaData, setSalaLimpaData] = useState<{ nome: string; qrCode: string } | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalData, setActionModalData] = useState<{ sala: Sala; actions: string[] } | null>(null);
  const [showMarcarSujaModal, setShowMarcarSujaModal] = useState(false);
  const [marcarSujaData, setMarcarSujaData] = useState<{ sala: Sala } | null>(null);
  const [observacaoSuja, setObservacaoSuja] = useState('');
    
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

  const getUserRoles = (user: any, groups: any[]): string[] => {
    const roles: string[] = [];
    if (isAdmin(user)) roles.push('administrador');
    if (isZelador(user, groups)) roles.push('zelador');
    if (isSolicitanteServico(user, groups)) roles.push('solicitante');
    return roles;
  };

  useEffect(() => {
    loadSalas();
  }, []);

  useEffect(() => {
    if (limpezaEmAndamento && dadosLimpeza) {
      console.log('🚨 Limpeza em andamento detectada no SalasScreen! Redirecionando...');
      navigation.navigate('LimpezaProcesso', {
        salaId: dadosLimpeza.salaId,
        salaNome: dadosLimpeza.salaNome,
        qrCodeScanned: false,
      });
    }
  }, [limpezaEmAndamento, dadosLimpeza, navigation]);

  useEffect(() => {
    if (qrCodeData) {
      const buscarDadosSala = async () => {
        try {
          const result = await getSala(qrCodeData);
          
          if (result.success && result.sala) {
            processarQRCodePorPapel(result.sala);
          } else {
            showAlert({
              title: 'Erro',
              message: 'Sala não encontrada.',
              type: 'error',
              confirmText: 'OK'
            });
          }
        } catch (error) {
          showAlert({
            title: 'Erro',
            message: 'Erro ao buscar dados da sala.',
            type: 'error',
            confirmText: 'OK'
          });
        }
        
        clearQRCodeData();
      };
      
      buscarDadosSala();
    }
  }, [qrCodeData, navigation, clearQRCodeData, getSala]);

  const processarQRCodePorPapel = (sala: Sala) => {
    const roles = getUserRoles(user, groups);
    
    console.log('=== PROCESSAR QR CODE POR PAPEL ===');
    console.log('Sala:', sala.nome_numero);
    console.log('Papéis do usuário:', roles);
    console.log('Status da sala:', sala.status_limpeza);
    
    if (roles.length > 1) {
      setActionModalData({ sala, actions: roles });
      setShowActionModal(true);
      return;
    }
    
    if (roles.length === 1) {
      executarAcaoPorPapel(roles[0], sala);
      return;
    }
    
    showAlert({
      title: 'Acesso Negado',
      message: 'Você não tem permissão para realizar nenhuma ação com salas.',
      type: 'warning',
      confirmText: 'OK'
    });
  };

  const executarAcaoPorPapel = (papel: string, sala: Sala) => {
    console.log('=== EXECUTAR AÇÃO POR PAPEL ===');
    console.log('Papel:', papel);
    console.log('Sala:', sala.nome_numero);
    
    switch (papel) {
      case 'zelador':
        if (sala.status_limpeza === 'Limpa') {
          setSalaLimpaData({
            nome: sala.nome_numero,
            qrCode: sala.qr_code_id
          });
          setShowSalaLimpaModal(true);
        } else {
          navigation.navigate('LimpezaProcesso', {
            salaId: sala.qr_code_id,
            salaNome: sala.nome_numero,
            qrCodeScanned: true
          });
        }
        break;
        
      case 'solicitante':
        setMarcarSujaData({ sala });
        setShowMarcarSujaModal(true);
        break;
        
      case 'administrador':
        setEditingSala(sala);
        setShowForm(true);
        break;
        
      default:
        showAlert({
          title: 'Erro',
          message: 'Papel de usuário não reconhecido.',
          type: 'error',
          confirmText: 'OK'
        });
    }
  };

  const loadSalas = async () => {
    await listSalas();
  };

  const handleFecharModalSalaLimpa = () => {
    setShowSalaLimpaModal(false);
    setSalaLimpaData(null);
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

  const handleMarcarComoSuja = async () => {
    if (!marcarSujaData) return;
    
    try {
      const data = observacaoSuja.trim() ? { observacoes: observacaoSuja.trim() } : undefined;
      const result = await marcarComoSuja(marcarSujaData.sala.qr_code_id, data);
      
      if (result.success) {
        showAlert({
          title: 'Sucesso',
          message: `A sala "${marcarSujaData.sala.nome_numero}" foi marcada como suja.`,
          type: 'success',
          confirmText: 'OK'
        });
        setShowMarcarSujaModal(false);
        setMarcarSujaData(null);
        setObservacaoSuja('');
        await loadSalas();
      } else {
        showAlert({
          title: 'Erro',
          message: result.error || 'Erro ao marcar sala como suja',
          type: 'error',
          confirmText: 'OK'
        });
      }
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Erro ao marcar sala como suja',
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredSalas = salas.filter(sala => {
    if (!isAdmin(user) && !sala.ativa) {
      return false;
    }

    let statusMatch = true;
    if (filterStatus === 'limpa') statusMatch = sala.status_limpeza === 'Limpa';
    if (filterStatus === 'suja') statusMatch = sala.status_limpeza === 'Suja';
    if (filterStatus === 'pendente') statusMatch = sala.status_limpeza === 'Limpeza Pendente';
    if (filterStatus === 'inativas') statusMatch = !sala.ativa;

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
    const suja = salas.filter(s => s.status_limpeza === 'Suja').length;
    const inativas = isAdmin(user) ? salas.filter(s => !s.ativa).length : 0;
    return { limpa, pendente, suja, inativas, total: salas.length };
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
        className={`px-4 py-2 rounded-full ${isActive
            ? 'opacity-100'
            : 'opacity-70'
          }`}
        style={{
          backgroundColor: isActive
            ? SENAC_COLORS.primary
            : (isDarkMode ? '#374151' : '#F3F4F6'),
          marginRight: 12,
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          <FilterButton status="all" label="Todas" count={statusCounts.total} />
          <FilterButton status="limpa" label="Limpas" count={statusCounts.limpa} />
          <FilterButton status="pendente" label="Pendentes" count={statusCounts.pendente} />
          <FilterButton status="suja" label="Sujas" count={statusCounts.suja} />
          {isAdmin(user) && (
            <FilterButton status="inativas" label="Inativas" count={statusCounts.inativas} />
          )}
        </ScrollView>

        {searchQuery.trim() && (
          <View className="mt-3">
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
              {filteredSalas.length} resultado{filteredSalas.length !== 1 ? 's' : ''} para "{searchQuery}"
            </Text>
          </View>
        )}
      </View>

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

      <SalaForm
        visible={showForm}
        onClose={handleCloseForm}
        sala={editingSala}
      />

      <Modal
        visible={showSalaLimpaModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleFecharModalSalaLimpa}
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
              A sala <Text className="font-semibold">{salaLimpaData?.nome}</Text> já está limpa.
            </Text>
            
            <Text className={`text-sm text-center mb-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Não é possível iniciar um processo de limpeza em uma sala que já está limpa.
            </Text>
            
            <TouchableOpacity
              onPress={handleFecharModalSalaLimpa}
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

      {/* Componentes de Modal Reutilizáveis */}
      <ActionSelectionModal
        visible={showActionModal}
        sala={actionModalData?.sala || null}
        actions={actionModalData?.actions || []}
        onActionSelect={(action) => {
          if (actionModalData) {
            setShowActionModal(false);
            executarAcaoPorPapel(action, actionModalData.sala);
          }
        }}
        onCancel={() => {
          setShowActionModal(false);
          setActionModalData(null);
        }}
      />

      <MarcarSujaModal
        visible={showMarcarSujaModal}
        sala={marcarSujaData?.sala || null}
        observacao={observacaoSuja}
        onObservacaoChange={setObservacaoSuja}
        onConfirm={handleMarcarComoSuja}
        onCancel={() => {
          setShowMarcarSujaModal(false);
          setMarcarSujaData(null);
          setObservacaoSuja('');
        }}
      />

      <SalaLimpaModal
        visible={showSalaLimpaModal}
        salaNome={salaLimpaData?.nome || null}
        onClose={handleFecharModalSalaLimpa}
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
    </SafeAreaView>
  );
};

export default SalasScreen;
