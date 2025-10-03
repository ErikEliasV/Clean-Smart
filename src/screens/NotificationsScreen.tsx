import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Bell, Check, CheckCheck } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import { SENAC_COLORS } from '../constants/colors';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';

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
  const { alertVisible, alertOptions, showAlert, hideAlert } = useCustomAlert();
  
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
      showAlert({
        title: 'Erro',
        message: 'Não foi possível marcar a notificação como lida',
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (notificacoesNaoLidas === 0) {
      showAlert({
        title: 'Informação',
        message: 'Todas as notificações já estão marcadas como lidas',
        type: 'info',
        confirmText: 'OK'
      });
      return;
    }

    showAlert({
      title: 'Marcar todas como lidas',
      message: `Deseja marcar todas as ${notificacoesNaoLidas} notificação(ões) não lida(s) como lidas?`,
      type: 'warning',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: async () => {
        const success = await marcarTodasComoLidas();
        if (!success) {
          showAlert({
            title: 'Erro',
            message: 'Não foi possível marcar todas as notificações como lidas',
            type: 'error',
            confirmText: 'OK'
          });
        }
      }
    });
  };

  const handleNotificationPress = async (notificacao: any) => {
    if (!notificacao.lida) {
      await handleMarkAsRead(notificacao.id);
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
      className={`mx-4 mb-4 rounded-2xl overflow-hidden border ${
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
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
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
                style={{ backgroundColor: isDarkMode ? '#374151' : '#F3F4F6' }}
              >
                {isMarkingAsRead === notificacao.id ? (
                  <ActivityIndicator size="small" color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
                ) : (
                  <Check 
                    size={16} 
                    color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  />
                )}
              </TouchableOpacity>
            )}
            
            {notificacao.lida && (
              <View 
                className="p-2 rounded-full" 
                style={{ backgroundColor: SENAC_COLORS.primary + '20' }}
              >
                <CheckCheck 
                  size={16} 
                  color={SENAC_COLORS.primary} 
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
            <View className={`mx-4 mb-6 rounded-2xl overflow-hidden border ${
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
                isDarkMode ? 'bg-gray-800' : 'bg-white'
              }`}>
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

export default NotificationsScreen;
