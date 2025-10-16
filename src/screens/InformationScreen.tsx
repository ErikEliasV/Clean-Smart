import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Circle, Path, G } from 'react-native-svg';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { generatePDFTemplate } from '../templates/pdfReportTemplate';
import { useAuth, isAdmin, isZelador, isCorpoDocente } from '../contexts/AuthContext';
import { useSalas } from '../contexts/SalasContext';
import { useLimpeza } from '../contexts/LimpezaContext';
import { useGroups } from '../contexts/GroupsContext';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { SalasStackParamList } from '../types/navigation';
import { 
  User, 
  Lock, 
  LogOut, 
  Sun,
  Moon,
  Shield,
  Crown,
  Building,
  Bell,
  CheckCircle,
  Clock,
  BarChart3,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Activity,
  PieChart as PieChartIcon,
  BarChart,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  History,
  PlayCircle,
  Award,
  Download,
  FileText
} from 'lucide-react-native';
import { SENAC_COLORS } from '../constants/colors';

type SalasNavigationProp = StackNavigationProp<SalasStackParamList>;

const InformationScreen: React.FC = () => {
  const navigation = useNavigation();
  const salasNavigation = useNavigation<SalasNavigationProp>();
  const { user, logout, isDarkMode, toggleTheme } = useAuth();
  const { salas, listSalas, isLoading, listRegistrosLimpeza } = useSalas();
  const { groups } = useGroups();
  const { limpezaEmAndamento, dadosLimpeza } = useLimpeza();
  const { alertVisible, alertOptions, showAlert, hideAlert } = useCustomAlert();
  const [salasLimpasPorZelador, setSalasLimpasPorZelador] = useState(0);
  const [isLoadingRegistros, setIsLoadingRegistros] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    loadSalasData();
  }, []);

  useEffect(() => {
    if (isZelador(user, groups)) {
      loadZeladorStats();
    }
  }, [user, groups]);

  useFocusEffect(
    useCallback(() => {
      console.log('📱 InformationScreen ganhou foco - Recarregando dados...');
      loadSalasData();
      if (isZelador(user, groups)) {
        loadZeladorStats();
      }
    }, [user, groups])
  );

  const loadSalasData = async () => {
    await listSalas();
  };

  const loadZeladorStats = async () => {
    setIsLoadingRegistros(true);
    try {
      const result = await listRegistrosLimpeza();
      if (result.success && result.registros) {
        const registrosConcluidos = result.registros.filter(
          (registro: any) => registro.data_hora_fim || registro.data_hora_limpeza
        );
        setSalasLimpasPorZelador(registrosConcluidos.length);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas do zelador:', error);
    } finally {
      setIsLoadingRegistros(false);
    }
  };

  const generatePDFReport = async () => {
    if (!isAdmin(user)) {
      showAlert({
        title: 'Acesso Negado',
        message: 'Apenas administradores podem gerar relatórios em PDF.',
        type: 'error',
        confirmText: 'OK'
      });
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const salasAtivas = salas.filter(s => s.ativa !== false);
      const salasInativas = salas.filter(s => !s.ativa);
      
      const html = generatePDFTemplate({
        salas,
        salasAtivas,
        salasInativas,
        salasStats,
        user
      });

      const { uri } = await Print.printToFileAsync({ 
        html,
        base64: false 
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar Relatório de Salas'
        });
      } else {
        showAlert({
          title: 'PDF Gerado',
          message: 'O relatório foi gerado com sucesso!',
          type: 'success',
          confirmText: 'OK'
        });
      }

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      showAlert({
        title: 'Erro',
        message: 'Erro ao gerar o relatório em PDF. Tente novamente.',
        type: 'error',
        confirmText: 'OK'
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const navigateToProfile = () => {
    // @ts-ignore 
    navigation.navigate('Profile');
  };

  const navigateToHistoricoLimpeza = () => {
    // @ts-ignore
    navigation.navigate('Salas', { 
      screen: 'RegistrosLimpeza'
    });
  };

  const navigateToLimpezaEmAndamento = () => {
    if (dadosLimpeza) {
      // @ts-ignore 
      navigation.navigate('Salas', {
        screen: 'LimpezaProcesso',
        params: {
          salaId: dadosLimpeza.salaId,
          salaNome: dadosLimpeza.salaNome,
          qrCodeScanned: false
        }
      });
    }
  };

  const getUserRoles = () => {
    const roles = [];
    
    if (isAdmin(user)) {
      roles.push('Administrador');
    }
    if (isZelador(user)) {
      roles.push('Zelador');
    }
    if (isCorpoDocente(user)) {
      roles.push('Corpo Docente');
    }
    
    if (roles.length === 0) {
      roles.push('Usuário');
    }
    
  return roles;
};

const BarChart = ({ data, isDarkMode }: { data: { label: string; value: number; color: string; max: number }[], isDarkMode: boolean }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View className="p-4 items-center">
        <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Nenhum dado disponível
        </Text>
      </View>
    );
  }
  
  return (
    <View className="space-y-3">
      {data.map((item, index) => (
      <View key={index} className="space-y-1">
        <View className="flex-row justify-between items-center">
          <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {item.label}
          </Text>
          <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {item.value}
          </Text>
        </View>
        <View className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <View 
            className="h-2 rounded-full"
            style={{ 
              width: `${(item.value / item.max) * 100}%`,
              backgroundColor: item.color
            }}
          />
        </View>
      </View>
    ))}
    </View>
  );
};

const PieChartComponent = ({ data, isDarkMode }: { data: { label: string; value: number; color: string }[], isDarkMode: boolean }) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <View className="p-6 items-center justify-center min-h-[200px]">
        <View className="items-center">
          <PieChartIcon size={32} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
          <Text className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Nenhum dado disponível
          </Text>
        </View>
      </View>
    );
  }
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  const createPieChart = () => {
    const size = 180; 
    const radius = 75; 
    const centerX = size / 2;
    const centerY = size / 2;
    
    let currentAngle = 0;
    const paths: React.ReactElement[] = [];
    
    data.forEach((item, index) => {
      const percentage = (item.value / total) * 100;
      const angle = (percentage / 100) * 360;
      
      if (angle > 0) {
        const startAngle = currentAngle;
        const endAngle = currentAngle + angle;
        
        const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
        
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ');
        
        paths.push(
          <Path
            key={index}
            d={pathData}
            fill={item.color}
            stroke={isDarkMode ? '#374151' : '#FFFFFF'}
            strokeWidth={2}
          />
        );
        
        currentAngle += angle;
      }
    });
    
    return paths;
  };
  
  return (
    <View className="p-4">
      {/* Gráfico de Pizza */}
      <View className="items-center mb-4">
        <Svg width={180} height={180}>
          {createPieChart()}
        </Svg>
      </View>
      
      {/* Legenda */}
      <View className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <View key={index} className="flex-row items-center justify-between py-2">
              <View className="flex-row items-center flex-1">
                <View 
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: item.color }}
                />
                <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {item.label}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className={`text-sm font-bold mr-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </Text>
                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({percentage}%)
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

  const handleLogout = () => {
    showAlert({
      title: 'Sair da Conta',
      message: 'Tem certeza que deseja sair da sua conta?',
      type: 'warning',
      confirmText: 'Sair',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: logout
    });
  };

  const salasAtivas = salas.filter(s => s.ativa !== false);
  const salasInativas = salas.filter(s => !s.ativa);

  const salasStats = {
    total: salasAtivas.length,
    limpas: salasAtivas.filter(s => s.status_limpeza === 'Limpa').length,
    pendentes: salasAtivas.filter(s => s.status_limpeza === 'Limpeza Pendente').length,
    sujas: salasAtivas.filter(s => s.status_limpeza === 'Suja').length,
    emLimpeza: salasAtivas.filter(s => s.status_limpeza === 'Em Limpeza').length,
    inativas: salasInativas.length,
    totalGeral: salas.length,
    percentualLimpas: salasAtivas.length > 0 ? Math.round((salasAtivas.filter(s => s.status_limpeza === 'Limpa').length / salasAtivas.length) * 100) : 0,
    percentualSujas: salasAtivas.length > 0 ? Math.round((salasAtivas.filter(s => s.status_limpeza === 'Suja').length / salasAtivas.length) * 100) : 0,
    percentualPendentes: salasAtivas.length > 0 ? Math.round((salasAtivas.filter(s => s.status_limpeza === 'Limpeza Pendente').length / salasAtivas.length) * 100) : 0,
    percentualEmLimpeza: salasAtivas.length > 0 ? Math.round((salasAtivas.filter(s => s.status_limpeza === 'Em Limpeza').length / salasAtivas.length) * 100) : 0
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadSalasData}
            colors={[SENAC_COLORS.primary]}
            tintColor={SENAC_COLORS.primary}
          />
        }
      >
        <View className="px-6 py-6 pb-8">

          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Olá, {user?.username}!
              </Text>
              <Text className={`text-base mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Dashboard de Zeladoria SENAC
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleTheme}
              className={`w-12 h-12 rounded-full items-center justify-center ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}
            >
              {isDarkMode ? (
                <Sun size={24} color={SENAC_COLORS.secondary} />
              ) : (
                <Moon size={24} color={SENAC_COLORS.primary} />
              )}
            </TouchableOpacity>
          </View>


          <TouchableOpacity 
            onPress={navigateToProfile}
            className={`p-6 rounded-3xl mb-8 ${
              isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
            }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="mr-4">
                {user?.profile?.profile_picture ? (
                  <Image
                    source={{ uri: user.profile.profile_picture }}
                    className="w-16 h-16 rounded-full"
                    style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
                  />
                ) : (
                  <View className={`w-16 h-16 rounded-full items-center justify-center ${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100/50'
                  }`}>
                    {isZelador(user) ? (
                      <Shield size={32} color={SENAC_COLORS.primary} />
                    ) : isAdmin(user) ? (
                      <Crown size={32} color={SENAC_COLORS.secondary} />
                    ) : (
                      <User size={32} color={SENAC_COLORS.primary} />
                    )}
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user?.username}
                </Text>
                <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.email || 'Sem email'}
                </Text>
                <View className="flex-row mt-2 flex-wrap">
                  {getUserRoles().map((role, index) => (
                    <View 
                      key={index}
                      className="px-2 py-1 rounded-full mr-2 mb-1" 
                      style={{ backgroundColor: `${SENAC_COLORS.primary}20` }}
                    >
                      <Text style={{ color: SENAC_COLORS.primary }} className="text-xs font-medium">
                        {role}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card de Limpeza em Andamento  */}
          {isZelador(user, groups) && limpezaEmAndamento && dadosLimpeza && (
            <View className={`p-5 rounded-3xl mb-6 border-2 ${
              isDarkMode ? 'bg-orange-900/30 border-orange-500/50' : 'bg-orange-50 border-orange-300'
            }`}>
              <View className="flex-row items-center mb-4">
                <View className={`w-12 h-12 rounded-full items-center justify-center ${
                  isDarkMode ? 'bg-orange-500/20' : 'bg-orange-500/30'
                }`}>
                  <Activity size={24} color="#F97316" />
                </View>
                <View className="flex-1 ml-3">
                  <Text className={`text-lg font-bold ${
                    isDarkMode ? 'text-orange-200' : 'text-orange-900'
                  }`}>
                    Limpeza em Andamento
                  </Text>
                  <Text className={`text-sm ${
                    isDarkMode ? 'text-orange-300' : 'text-orange-700'
                  }`}>
                    Você tem uma limpeza não finalizada
                  </Text>
                </View>
              </View>
              
              <View className={`p-3 rounded-xl mb-3 ${
                isDarkMode ? 'bg-orange-800/30' : 'bg-orange-100'
              }`}>
                <View className="flex-row items-center mb-1">
                  <Building size={16} color="#F97316" />
                  <Text className={`ml-2 text-sm font-semibold ${
                    isDarkMode ? 'text-orange-200' : 'text-orange-800'
                  }`}>
                    {dadosLimpeza.salaNome}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Clock size={16} color="#F97316" />
                  <Text className={`ml-2 text-xs ${
                    isDarkMode ? 'text-orange-300' : 'text-orange-700'
                  }`}>
                    Iniciada em: {new Date(dadosLimpeza.inicioLimpeza).toLocaleString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={navigateToLimpezaEmAndamento}
                className={`p-4 rounded-xl flex-row items-center justify-center ${
                  isDarkMode ? 'bg-orange-600' : 'bg-orange-500'
                }`}
                activeOpacity={0.7}
              >
                <PlayCircle size={20} color="white" />
                <Text className="ml-2 text-white text-base font-semibold">
                  Retomar Limpeza
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Estatísticas do Zelador - Para todos os zeladores (incluindo admins) */}
          {isZelador(user, groups) && (
            <View className="mb-8">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Award size={24} color={SENAC_COLORS.primary} />
                  <Text className={`text-xl font-bold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Minhas Estatísticas
                  </Text>
                </View>
              </View>

              {/* Card com Estatísticas do Zelador */}
              <View className={`p-5 rounded-3xl mb-4 ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              } ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
                
                {/* Contador de Salas Limpas */}
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className={`w-12 h-12 rounded-full items-center justify-center`}
                           style={{ backgroundColor: `${SENAC_COLORS.primary}20` }}>
                        <CheckCircle size={24} color={SENAC_COLORS.primary} />
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className={`text-xs font-medium ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          LIMPEZAS REALIZADAS
                        </Text>
                        <Text className={`text-3xl font-bold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {isLoadingRegistros ? '...' : salasLimpasPorZelador}
                        </Text>
                      </View>
                    </View>
                    <Text className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Total de salas limpas por você
                    </Text>
                  </View>
                </View>

                {/* Botão para Ver Histórico */}
                <TouchableOpacity
                  onPress={navigateToHistoricoLimpeza}
                  className={`p-4 rounded-xl flex-row items-center justify-center ${
                    isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
                  }`}
                  activeOpacity={0.7}
                >
                  <History size={20} color="white" />
                  <Text className="ml-2 text-white text-base font-semibold">
                    Ver Meu Histórico de Limpezas
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Estatísticas Principais */}
          <View className="mb-8">
            <View className="flex-row items-center mb-6">
               <View className="flex-row items-center">
                 <BarChart3 size={24} color={SENAC_COLORS.primary} />
                 <Text className={`text-xl font-bold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                   {isAdmin(user) 
                     ? 'Dashboard Geral de Salas' 
                     : 'Dashboard de Salas'}
                 </Text>
               </View>
            </View>
            
              {/* Cards de Estatísticas */}
              <View className="gap-4 mb-3">
                {/* Card TOTAL */}
                <View className={`p-4 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
                } border border-gray-200/20`}>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className={`w-12 h-12 rounded-full items-center justify-center`} 
                         style={{ backgroundColor: `${SENAC_COLORS.primary}20` }}>
                      <Building size={24} color={SENAC_COLORS.primary} />
                    </View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      TOTAL
                    </Text>
                  </View>
                  <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {salasStats.total}
                  </Text>
                  <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Salas Cadastradas
                  </Text>
                  <Text className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    100%
                  </Text>
                </View>

                {/* Card LIMPAS */}
                <View className={`p-4 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
                } border border-gray-200/20`}>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className={`w-12 h-12 rounded-full items-center justify-center`} 
                         style={{ backgroundColor: '#10B98120' }}>
                      <CheckCircle size={24} color="#10B981" />
                    </View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      LIMPAS
                    </Text>
                  </View>
                  <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {salasStats.limpas}
                  </Text>
                  <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Salas Limpas
                  </Text>
                  <Text className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {salasStats.percentualLimpas}%
                  </Text>
                </View>

                {/* Card PENDENTES */}
                <View className={`p-4 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
                } border border-gray-200/20`}>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className={`w-12 h-12 rounded-full items-center justify-center`} 
                         style={{ backgroundColor: '#F59E0B20' }}>
                      <Clock size={24} color="#F59E0B" />
                    </View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      PENDENTES
                    </Text>
                  </View>
                  <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {salasStats.pendentes}
                  </Text>
                  <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Salas Pendentes
                  </Text>
                  <Text className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {salasStats.percentualPendentes}%
                  </Text>
                </View>

                {/* Card SUJAS */}
                <View className={`p-4 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
                } border border-gray-200/20`}>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className={`w-12 h-12 rounded-full items-center justify-center`} 
                         style={{ backgroundColor: '#EF444420' }}>
                      <AlertTriangle size={24} color="#EF4444" />
                    </View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      SUJAS
                    </Text>
                  </View>
                  <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {salasStats.sujas}
                  </Text>
                  <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Salas Sujas
                  </Text>
                  <Text className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {salasStats.percentualSujas}%
                  </Text>
                </View>

                {/* Card EM LIMPEZA */}
                <View className={`p-4 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
                } border border-gray-200/20`}>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className={`w-12 h-12 rounded-full items-center justify-center`} 
                         style={{ backgroundColor: '#3B82F620' }}>
                      <Activity size={24} color="#3B82F6" />
                    </View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      EM LIMPEZA
                    </Text>
                  </View>
                  <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {salasStats.emLimpeza}
                  </Text>
                  <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Salas em Limpeza
                  </Text>
                  <Text className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {salasStats.percentualEmLimpeza}%
                  </Text>
                </View>

                {/* Card INATIVAS */}
                <View className={`p-4 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
                } border border-gray-200/20`}>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className={`w-12 h-12 rounded-full items-center justify-center`} 
                         style={{ backgroundColor: '#6B728020' }}>
                      <XCircle size={24} color="#6B7280" />
                    </View>
                    <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      INATIVAS
                    </Text>
                  </View>
                  <Text className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                    {salasStats.inativas}
                  </Text>
                  <Text className={`text-base ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Salas Inativas
                  </Text>
                  <Text className={`text-sm font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {salasStats.total > 0 ? Math.round((salasStats.inativas / salasStats.total) * 100) : 0}%
                  </Text>
                </View>
              </View>
              
              {/* Botão de Download PDF */}
              {isAdmin(user) && (
                <View className="mt-6">
                  <TouchableOpacity
                    onPress={generatePDFReport}
                    disabled={isGeneratingPDF}
                    className={`flex-row items-center justify-center px-6 py-4 rounded-2xl ${
                      isGeneratingPDF ? 'opacity-50' : ''
                    }`}
                    style={{ backgroundColor: SENAC_COLORS.primary }}
                    activeOpacity={0.7}
                  >
                    {isGeneratingPDF ? (
                      <ActivityIndicator size={20} color="white" />
                    ) : (
                      <Download size={20} color="white" />
                    )}
                    <Text className="text-white font-semibold ml-3 text-base">
                      {isGeneratingPDF ? 'Gerando Relatório...' : 'Baixar Relatório PDF'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>

          {/* Gráficos Visuais */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <BarChart3 size={20} color={SENAC_COLORS.primary} />
              <Text className={`text-lg font-bold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Análise Visual
              </Text>
            </View>
            
            <View className="gap-3">
              {/* Gráfico de Barras - Status das Salas */}
              <View className={`p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <View className="flex-row items-center mb-4">
                  <BarChart3 size={20} color={SENAC_COLORS.primary} />
                  <Text className={`text-base font-semibold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Distribuição por Status
                  </Text>
                </View>
                <BarChart 
                  data={salasStats.total > 0 ? [
                    { label: 'Limpas', value: salasStats.limpas, color: '#10B981', max: salasStats.total },
                    { label: 'Pendentes', value: salasStats.pendentes, color: '#F59E0B', max: salasStats.total },
                    { label: 'Sujas', value: salasStats.sujas, color: '#EF4444', max: salasStats.total },
                    { label: 'Em Limpeza', value: salasStats.emLimpeza, color: '#3B82F6', max: salasStats.total }
                  ] : []}
                  isDarkMode={isDarkMode}
                />
              </View>

              {/* Gráfico de Pizza - Percentuais */}
              <View className={`p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <View className="flex-row items-center mb-4">
                  <PieChartIcon size={20} color={SENAC_COLORS.secondary} />
                  <Text className={`text-base font-semibold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Percentual de Status
                  </Text>
                </View>
                <PieChartComponent 
                  data={salasStats.total > 0 ? [
                    { label: 'Limpas', value: salasStats.limpas, color: '#10B981' },
                    { label: 'Pendentes', value: salasStats.pendentes, color: '#F59E0B' },
                    { label: 'Sujas', value: salasStats.sujas, color: '#EF4444' },
                    { label: 'Em Limpeza', value: salasStats.emLimpeza, color: '#3B82F6' }
                  ] : []}
                  isDarkMode={isDarkMode}
                />
              </View>
            </View>
          </View>

          {/* Insights e Tendências */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <Lightbulb size={20} color={SENAC_COLORS.secondary} />
              <Text className={`text-lg font-bold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Insights Inteligentes
              </Text>
            </View>
            
            <View className="gap-3">
              {/* Progresso Geral */}
              {salasStats.total > 0 && (
                <View className={`p-4 rounded-2xl ${
                  isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
                }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Target size={20} color={SENAC_COLORS.primary} />
                      <Text className={`text-base font-semibold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Progresso Geral de Limpeza
                      </Text>
                    </View>
                    <Text className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {salasStats.percentualLimpas}%
                    </Text>
                  </View>
                  <View className={`h-4 rounded-full mb-3 ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <View 
                      className="h-4 rounded-full"
                      style={{ 
                        width: `${salasStats.percentualLimpas}%`,
                        backgroundColor: salasStats.percentualLimpas >= 80 ? '#10B981' : 
                                       salasStats.percentualLimpas >= 60 ? '#F59E0B' : '#EF4444'
                      }}
                    />
                  </View>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {salasStats.limpas} de {salasStats.total} salas limpas
                  </Text>
                </View>
              )}

              {/* Alertas e Recomendações */}
              <View className={`p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <View className="flex-row items-center mb-3">
                  <TrendingUp size={20} color={SENAC_COLORS.primary} />
                  <Text className={`text-base font-semibold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recomendações
                  </Text>
                </View>
                
                <View className="space-y-3">
                  {salasStats.sujas > 0 && (
                    <View className="flex-row items-center">
                      <AlertCircle size={16} color="#EF4444" />
                      <Text className={`text-sm ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {salasStats.sujas} sala(s) precisam de limpeza urgente
                      </Text>
                    </View>
                  )}
                  
                  {salasStats.pendentes > 0 && (
                    <View className="flex-row items-center">
                      <Clock size={16} color="#F59E0B" />
                      <Text className={`text-sm ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {salasStats.pendentes} sala(s) com limpeza pendente
                      </Text>
                    </View>
                  )}
                  
                  {salasStats.percentualLimpas >= 90 && (
                    <View className="flex-row items-center">
                      <CheckCircle2 size={16} color="#10B981" />
                      <Text className={`text-sm ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Excelente! Mais de 90% das salas estão limpas
                      </Text>
                    </View>
                  )}
                  
                  {salasStats.inativas > 0 && (
                     <View className="flex-row items-center">
                       <XCircle size={16} color="#6B7280" />
                       <Text className={`text-sm ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                         {salasStats.inativas} sala(s) inativa(s) no sistema
                       </Text>
                     </View>
                  )}
                </View>
              </View>

              {/* Resumo Executivo */}
              <View className={`p-4 rounded-2xl ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              }  ${isDarkMode ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <View className="flex-row items-center mb-3">
                  <BarChart3 size={20} color={SENAC_COLORS.secondary} />
                  <Text className={`text-base font-semibold ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Resumo Executivo
                  </Text>
                </View>
                
                <View className="flex-row gap-4">
                  <View>
                    <Text className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      EFICIÊNCIA
                    </Text>
                    <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {salasStats.percentualLimpas}%
                    </Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {salasStats.percentualLimpas >= 80 ? 'Excelente' : 
                       salasStats.percentualLimpas >= 60 ? 'Bom' : 'Precisa melhorar'}
                    </Text>
                  </View>
                  
                  <View>
                    <Text className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      ATIVIDADE
                    </Text>
                    <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {salasStats.pendentes + salasStats.sujas}
                    </Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      Ações pendentes
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>




           <TouchableOpacity
             onPress={handleLogout}
             className="flex-row items-center justify-center p-4 rounded-2xl"
             style={{ backgroundColor: `${SENAC_COLORS.error}E6` }}
           >
             <LogOut size={20} color="white" />
            <Text className="ml-3 text-base font-medium text-white">
              Sair da Conta
            </Text>
           </TouchableOpacity>
         </View>
       </ScrollView>

       {/* Custom Alert */}
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

export default InformationScreen;
