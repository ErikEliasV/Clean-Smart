import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Bell, Check, CheckCheck, ExternalLink } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { SENAC_COLORS } from '../constants/colors';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDarkMode } = useAuth();
  const { 
    notificacoes, 
    notificacoesNaoLidas, 
    isLoading, 
    carregarNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas
  } = useNotifications();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMarkingAsRead, setIsMarkingAsRead] = useState<number | null>(null);

  useEffect(() => {
    carregarNotificacoes();
  }, [carregarNotificacoes]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await carregarNotificacoes();
    setIsRefreshing(false);
  };

  const handleMarkAsRead = async (id: number) => {
    setIsMarkingAsRead(id);
    const success = await marcarComoLida(id);
    setIsMarkingAsRead(null);
    
    if (!success) {
      Alert.alert('Erro', 'Não foi possível marcar a notificação como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notificacoesNaoLidas === 0) {
      Alert.alert('Informação', 'Todas as notificações já estão marcadas como lidas');
      return;
    }

    Alert.alert(
      'Marcar todas como lidas',
      `Deseja marcar todas as ${notificacoesNaoLidas} notificação(ões) não lida(s) como lidas?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            const success = await marcarTodasComoLidas();
            if (!success) {
              Alert.alert('Erro', 'Não foi possível marcar todas as notificações como lidas');
            }
          }
        }
      ]
    );
  };

  const handleNotificationPress = async (notificacao: any) => {
    if (!notificacao.lida) {
      await handleMarkAsRead(notificacao.id);
    }
    
    if (notificacao.link && notificacao.link !== '/') {
      try {
        const url = `https://zeladoria.tsr.net.br${notificacao.link}`;
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Erro', 'Não foi possível abrir o link');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível abrir o link');
      }
    }
  };

  const formatNotificationDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const renderNotification = (notificacao: any) => (
    <TouchableOpacity
      key={notificacao.id}
      onPress={() => handleNotificationPress(notificacao)}
      activeOpacity={0.7}
      className={`mx-4 mb-4 rounded-2xl overflow-hidden shadow-sm border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className={`p-4 ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
      } backdrop-blur-sm`}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-start">
              {!notificacao.lida && (
                <View className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              )}
              <View className="flex-1">
                <Text 
                  className={`text-base font-medium ${
                    notificacao.lida 
                      ? (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                      : (isDarkMode ? 'text-white' : 'text-gray-900')
                  }`}
                >
                  {notificacao.mensagem}
                </Text>
                
                <View className="flex-row items-center mt-2">
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    {formatNotificationDate(notificacao.data_criacao)}
                  </Text>
                  
                  {notificacao.link && notificacao.link !== '/' && (
                    <View className="flex-row items-center ml-2">
                      <ExternalLink size={12} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                      <Text className={`text-xs ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Link disponível
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>
          
          <View className="items-center">
            {!notificacao.lida && (
              <TouchableOpacity
                onPress={() => handleMarkAsRead(notificacao.id)}
                disabled={isMarkingAsRead === notificacao.id}
                className="p-2 rounded-full"
                style={{ backgroundColor: SENAC_COLORS.primary + '20' }}
              >
                {isMarkingAsRead === notificacao.id ? (
                  <ActivityIndicator size="small" color={SENAC_COLORS.primary} />
                ) : (
                  <Check 
                    size={16} 
                    color={SENAC_COLORS.primary}
                  />
                )}
              </TouchableOpacity>
            )}
            
            {notificacao.lida && (
              <View className="p-2 rounded-full" style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}>
                <CheckCheck 
                  size={16} 
                  color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
                />
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && notificacoes.length === 0) {
    return (
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={SENAC_COLORS.primary} />
          <Text className={`mt-4 text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Carregando notificações...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`} edges={['top', 'left', 'right']}>
      <View className={`px-6 py-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="p-2 -ml-2 mr-2"
            >
              <ChevronLeft 
                size={24} 
                color={isDarkMode ? '#9CA3AF' : '#6B7280'} 
              />
            </TouchableOpacity>
            
            <View className="flex-row items-center">
              <Bell size={24} color={SENAC_COLORS.primary} />
              <Text className={`text-2xl font-bold ml-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Notificações
              </Text>
              {notificacoesNaoLidas > 0 && (
                <View className="ml-2 bg-red-500 rounded-full px-2 py-1">
                  <Text className="text-white text-xs font-bold">
                    {notificacoesNaoLidas}
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          {notificacoesNaoLidas > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              className="flex-row items-center px-3 py-2 rounded-lg"
              style={{ backgroundColor: SENAC_COLORS.primary }}
            >
              <CheckCheck size={16} color="white" />
              <Text className="text-white text-sm font-medium ml-1">
                Marcar todas
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[SENAC_COLORS.primary]}
            tintColor={SENAC_COLORS.primary}
          />
        }
      >
        {notificacoes.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Bell size={64} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
            <Text className={`text-xl font-medium mt-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Nenhuma notificação
            </Text>
            <Text className={`text-base text-center mt-2 px-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Você não possui notificações no momento
            </Text>
          </View>
        ) : (
          <>
            <View className={`mx-4 mb-6 rounded-2xl overflow-hidden shadow-sm border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
              <View className={`p-4 ${
                isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'
              } backdrop-blur-sm`}>
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Total: {notificacoes.length}
                    </Text>
                    <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notificacoesNaoLidas} não lida(s)
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {notificacoesNaoLidas}
                    </Text>
                    <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      pendentes
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {notificacoes.map(renderNotification)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationsScreen;
