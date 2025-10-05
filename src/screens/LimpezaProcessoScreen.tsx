import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, CheckCircle, Clock, Camera, X, AlertTriangle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { useGroups } from '../contexts/GroupsContext';
import { useSalas } from '../contexts/SalasContext';
import { useBottomTabs } from '../contexts/BottomTabsContext';
import { SENAC_COLORS } from '../constants/colors';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { StackScreenProps } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';
import { SalasStackParamList } from '../types/navigation';
import { useCallback } from 'react';

type LimpezaProcessoScreenProps = StackScreenProps<SalasStackParamList, 'LimpezaProcesso'>;

const LimpezaProcessoScreen: React.FC<LimpezaProcessoScreenProps> = ({ navigation, route }) => {
  const { isDarkMode, user } = useAuth();
  const { groups, getGroupName } = useGroups();
  const { alertVisible, alertOptions, showAlert, hideAlert } = useCustomAlert();
  const { iniciarLimpeza, concluirLimpeza, uploadFotoLimpeza, getSala, marcarComoSuja, listRegistrosLimpeza } = useSalas();
  const { setHideBottomTabs } = useBottomTabs();
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limpezaIniciada, setLimpezaIniciada] = useState(false);
  const [inicioLimpeza, setInicioLimpeza] = useState<Date | null>(null);
  const [tempoDecorrido, setTempoDecorrido] = useState('0:00');
  const [fotosLimpeza, setFotosLimpeza] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [registroLimpezaId, setRegistroLimpezaId] = useState<number | null>(null);
  const [salaData, setSalaData] = useState<any>(null);
  const [observacoesSalaSuja, setObservacoesSalaSuja] = useState<string>('');

  const { salaId, salaNome, qrCodeScanned } = route.params;

  const isAdmin = (user: any): boolean => {
    return user?.is_superuser || false;
  };

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

  useEffect(() => {
    setHideBottomTabs(limpezaIniciada);
    
    return () => {
      setHideBottomTabs(false);
    };
  }, [limpezaIniciada, setHideBottomTabs]);

  useEffect(() => {
    if (qrCodeScanned && salaId) {
      carregarDadosSala();
    }
  }, [qrCodeScanned, salaId]);

  const carregarDadosSala = async () => {
    try {
      setIsLoading(true);
      
      const result = await getSala(salaId);
      if (!result.success || !result.sala) {
        showAlert({
          title: 'Erro',
          message: 'Sala não encontrada.',
          type: 'error',
          confirmText: 'OK'
        });
        navigation.goBack();
        return;
      }
      
      setSalaData(result.sala);
      
      console.log('=== DADOS DA SALA CARREGADOS ===');
      console.log('Sala:', result.sala);
      console.log('Instruções:', result.sala.instrucoes);
      console.log('Tem instruções?', !!result.sala.instrucoes);
      
      if (result.sala.status_limpeza === 'Suja') {
        console.log('Sala encontrada como SUJA, buscando observações...');
        await buscarObservacoesSalaSuja(result.sala.id as number, result.sala);
      } else {
        console.log('Sala NÃO está suja, status:', result.sala.status_limpeza);
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados da sala:', error);
      showAlert({
        title: 'Erro',
        message: 'Erro ao carregar dados da sala.',
        type: 'error',
        confirmText: 'OK'
      });
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  const buscarObservacoesSalaSuja = async (salaId: number, dadosSala?: any) => {
    try {
      console.log('=== DEBUG OBSERVAÇÕES SALA SUJA ===');
      console.log('salaId:', salaId);
      console.log('dadosSala recebido:', dadosSala);
      console.log('salaData do estado:', salaData);
      
      const sala = dadosSala || salaData;
      
      if (sala && sala.status_limpeza === 'Suja') {
        console.log('Usando dados da sala:', JSON.stringify(sala, null, 2));
        
        if (sala.detalhes_suja && sala.detalhes_suja.observacoes) {
          console.log('Encontrado observação em detalhes_suja.observacoes:', sala.detalhes_suja.observacoes);
          setObservacoesSalaSuja(sala.detalhes_suja.observacoes);
          return;
        }

        const campos = [
          'observacoes_suja',
          'ultima_observacao_suja', 
          'observacao_marcacao_suja',
          'observacoes_marcacao_suja',
          'motivo_suja',
          'observacoes',
          'ultima_observacao',
          'observacao_atual'
        ];
        
        for (const campo of campos) {
          const valor = (sala as any)[campo];
          if (valor && valor.trim && valor.trim() !== '') {
            console.log(`Encontrado observação no campo ${campo}:`, valor);
            setObservacoesSalaSuja(valor);
            return;
          }
        }
      }
      
      
      console.log('Buscando observações nos registros de limpeza...');
      const registrosResult = await listRegistrosLimpeza(salaId);
      if (registrosResult.success && registrosResult.registros) {
        console.log('Registros encontrados:', registrosResult.registros.length);
        console.log('Todos os registros para debug:', registrosResult.registros);
        
        const registrosDaSala = registrosResult.registros.filter(registro => {
          const match = registro.sala === sala?.qr_code_id || 
                        registro.sala_nome === sala?.nome_numero;
          console.log(`Comparando registro sala: ${registro.sala} com ${sala?.qr_code_id} - Match: ${match}`);
          return match;
        });
        
        console.log('Registros da sala específica:', registrosDaSala);
        
        const registrosRelevantes = registrosDaSala.filter(registro => {
          return registro.observacoes && 
                 registro.observacoes.trim() !== '' &&
                 registro.observacoes !== 'Limpeza realizada com sucesso' &&
                 registro.observacoes !== 'Limpeza concluída' &&
                 !registro.observacoes.includes('Limpeza realizada') &&
                 !registro.observacoes.includes('Limpeza concluída');
        });
        
        console.log('Registros relevantes encontrados:', registrosRelevantes.length);
        console.log('Registros relevantes:', registrosRelevantes);
        
        if (registrosRelevantes.length > 0) {
          const registroMaisRecente = registrosRelevantes.sort((a, b) => 
            new Date(b.data_hora_limpeza).getTime() - new Date(a.data_hora_limpeza).getTime()
          )[0];
          
          console.log('Observação encontrada nos registros:', registroMaisRecente.observacoes);
          setObservacoesSalaSuja(registroMaisRecente.observacoes || '');
        } else {
          console.log('Nenhuma observação encontrada nos registros relevantes');
          console.log('⚠️ ATENÇÃO: As observações de marcação como suja não estão sendo salvas pelo backend');
          console.log('⚠️ As observações enviadas não estão disponíveis nos registros de limpeza');
          setObservacoesSalaSuja('Esta sala foi marcada como suja e requer atenção especial durante a limpeza.');
        }
      } else {
        console.log('Erro ao buscar registros de limpeza');
        setObservacoesSalaSuja('Esta sala foi marcada como suja e requer atenção especial durante a limpeza.');
      }
      
    } catch (error) {
      console.error('Erro geral ao buscar observações da sala suja:', error);
      setObservacoesSalaSuja('Sala marcada como suja - erro ao carregar observações');
    }
  };

  const marcarSalaComoSuja = async (qrCodeId: string) => {
    try {
      setIsLoading(true);
      const result = await marcarComoSuja(qrCodeId, { observacoes: 'Marcada como suja via QR Code' });
      
      if (result.success) {
        showAlert({
          title: 'Sucesso',
          message: 'Sala marcada como suja com sucesso.',
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => navigation.goBack()
        });
      } else {
        showAlert({
          title: 'Erro',
          message: result.error || 'Erro ao marcar sala como suja.',
          type: 'error',
          confirmText: 'OK'
        });
      }
    } catch (error) {
      console.error('Erro ao marcar sala como suja:', error);
      showAlert({
        title: 'Erro',
        message: 'Erro ao marcar sala como suja.',
        type: 'error',
        confirmText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const iniciarLimpezaAutomatica = async (qrCodeId: string) => {
    try {
      
      setIsLoading(true);
      const result = await iniciarLimpeza(qrCodeId);
      
      if (result.success && result.registro) {
        setRegistroLimpezaId(result.registro.id);
        setLimpezaIniciada(true);
        setInicioLimpeza(new Date());
        
        showAlert({
          title: 'Limpeza Iniciada',
          message: 'Limpeza iniciada com sucesso! Você não pode sair desta tela até finalizar a limpeza.',
          type: 'success',
          confirmText: 'OK'
        });
      } else {
        showAlert({
          title: 'Erro',
          message: result.error || 'Erro ao iniciar limpeza.',
          type: 'error',
          confirmText: 'OK'
        });
      }
    } catch (error) {
      console.error('Erro ao iniciar limpeza:', error);
      showAlert({
        title: 'Erro',
        message: 'Erro ao iniciar limpeza.',
        type: 'error',
        confirmText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (limpezaIniciada) {
          showAlert({
            title: 'Limpeza em Andamento',
            message: 'Você não pode sair da tela enquanto a limpeza estiver em andamento. Finalize a limpeza primeiro.',
            type: 'warning',
            confirmText: 'OK'
          });
          return true;
        }
        return false;
      };

      const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (!limpezaIniciada) {
          return;
        }

        e.preventDefault();

        showAlert({
          title: 'Limpeza em Andamento',
          message: 'Você não pode sair da tela enquanto a limpeza estiver em andamento. Finalize a limpeza primeiro.',
          type: 'warning',
          confirmText: 'OK'
        });
      });

      return unsubscribe;
    }, [limpezaIniciada, navigation])
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (limpezaIniciada && inicioLimpeza) {
      interval = setInterval(() => {
        setTempoDecorrido(formatTempoDecorrido(inicioLimpeza));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [limpezaIniciada, inicioLimpeza]);

  const handleIniciarLimpeza = async () => {
    if (!salaId) {
      showAlert({
        title: 'Erro',
        message: 'ID da sala não encontrado',
        type: 'error',
        confirmText: 'OK'
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await iniciarLimpeza(salaId);
      
      if (result.success && result.registro) {
    setLimpezaIniciada(true);
    setInicioLimpeza(new Date());
        setRegistroLimpezaId(result.registro.id);
        showAlert({
          title: 'Limpeza Iniciada',
          message: 'A limpeza foi iniciada. Quando terminar, clique em "Finalizar Limpeza" para concluir o processo.',
          type: 'success',
          confirmText: 'OK'
        });
      } else {
        showAlert({
          title: 'Erro',
          message: result.error || 'Erro ao iniciar limpeza',
          type: 'error',
          confirmText: 'OK'
        });
      }
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Erro ao iniciar limpeza',
        type: 'error',
        confirmText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalizarLimpeza = async () => {
    if (!salaId) {
      showAlert({
        title: 'Erro',
        message: 'ID da sala não encontrado',
        type: 'error',
        confirmText: 'OK'
      });
      return;
    }

    if (fotosLimpeza.length === 0) {
      showAlert({
        title: 'Foto Obrigatória',
        message: 'É necessário adicionar pelo menos 1 foto da limpeza para finalizar o processo.',
        type: 'warning',
        confirmText: 'Entendi'
      });
      return;
    }

    setIsLoading(true);
    try {
      if (registroLimpezaId && fotosLimpeza.length > 0) {
        for (const fotoUri of fotosLimpeza) {
          try {
            await uploadFotoLimpeza(registroLimpezaId, fotoUri);
          } catch (error) {
            console.error('Erro ao enviar foto:', error);
          }
        }
      }

      const data = observacoes.trim() ? { observacoes: observacoes.trim() } : {};
      const result = await concluirLimpeza(salaId, data);
      
      if (result.success) {
        setLimpezaIniciada(false);
        setInicioLimpeza(null);
        setRegistroLimpezaId(null);
        setFotosLimpeza([]);
        setObservacoes('');
        
        showAlert({
          title: 'Sucesso',
          message: 'Limpeza finalizada com sucesso!',
          type: 'success',
          confirmText: 'OK',
          onConfirm: () => navigation.goBack()
        });
      } else {
        showAlert({
          title: 'Erro',
          message: result.error || 'Erro ao finalizar limpeza',
          type: 'error',
          confirmText: 'OK'
        });
      }
    } catch (error) {
      showAlert({
        title: 'Erro',
        message: 'Erro ao finalizar limpeza',
        type: 'error',
        confirmText: 'OK'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTempoDecorrido = (inicio: Date): string => {
    const agora = new Date();
    const diffMs = agora.getTime() - inicio.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
        showAlert({
          title: 'Permissão Necessária',
          message: 'Precisamos de permissão para acessar sua galeria de fotos.',
          type: 'info',
          confirmText: 'OK'
        });
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1, // Muito reduzido para evitar erro 413
        base64: false,
        exif: false, // Remove dados EXIF para reduzir tamanho
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      showAlert({
        title: 'Erro',
        message: 'Não foi possível selecionar a imagem.',
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showAlert({
        title: 'Permissão Necessária',
        message: 'Precisamos de permissão para acessar sua câmera.',
        type: 'info',
        confirmText: 'OK'
      });
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.1, // Muito reduzido para evitar erro 413
        base64: false,
        exif: false, // Remove dados EXIF para reduzir tamanho
      });

      if (!result.canceled && result.assets[0]) {
        await uploadPhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      showAlert({
        title: 'Erro',
        message: 'Não foi possível tirar a foto.',
        type: 'error',
        confirmText: 'OK'
      });
    }
  };

  const uploadPhoto = async (imageUri: string) => {
    setFotosLimpeza(prev => [...prev, imageUri]);
    showAlert({
      title: 'Foto Adicionada',
      message: 'Foto adicionada com sucesso! Ela será enviada quando você finalizar a limpeza.',
      type: 'success',
      confirmText: 'OK'
    });
  };

  const showImageOptions = () => {
    if (fotosLimpeza.length >= 3) {
      showAlert({
        title: 'Limite de Fotos',
        message: 'Você pode adicionar no máximo 3 fotos da limpeza.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }
    
    showAlert({
      title: 'Adicionar Foto',
      message: 'As fotos serão comprimidas para facilitar o upload. Isso pode reduzir ligeiramente a qualidade da imagem.',
      type: 'info',
      confirmText: 'Continuar',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: takePhoto
    });
  };

  const removePhoto = (index: number) => {
    showAlert({
      title: 'Remover Foto',
      message: 'Tem certeza que deseja remover esta foto?',
      type: 'warning',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      showCancel: true,
      onConfirm: () => {
        setFotosLimpeza(prev => prev.filter((_, i) => i !== index));
      }
    });
  };

  return (
    <SafeAreaView className={`flex-1 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`} edges={['top']}>
      <View className={`flex-row items-center justify-between p-4 border-b ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {!limpezaIniciada && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 rounded-full"
            style={{ backgroundColor: SENAC_COLORS.primary + '20' }}
          >
            <ChevronLeft size={24} color={SENAC_COLORS.primary} />
          </TouchableOpacity>
        )}
        
        {limpezaIniciada && (
          <View className="w-10 h-10" />
        )}
        
        <Text className={`text-lg font-bold ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Processo de Limpeza
        </Text>
        
        <View style={{ width: 40 }} />
      </View>

             <ScrollView className="flex-1">
         <View className={`mt-4 mx-4 mb-3 p-4 rounded-xl ${
           isDarkMode ? 'bg-gray-800' : 'bg-white'
         } shadow-sm border ${
           isDarkMode ? 'border-gray-700' : 'border-gray-200'
         }`}>
           <View className="flex-row items-center mb-2">
             <Text className={`text-lg font-bold ${
               isDarkMode ? 'text-white' : 'text-gray-900'
             }`}>
               {salaNome}
             </Text>
           </View>
           <Text className={`text-sm ${
             isDarkMode ? 'text-gray-300' : 'text-gray-600'
           }`}>
             Inicie o processo de limpeza e finalize quando concluir
           </Text>
         </View>

         {/* Observações da Sala Suja */}
         {salaData?.status_limpeza === 'Suja' && observacoesSalaSuja && (
           <View className={`mx-4 mb-3 p-4 rounded-xl ${
             isDarkMode ? 'bg-red-900' : 'bg-red-50'
           } border ${
             isDarkMode ? 'border-red-700' : 'border-red-200'
           }`}>
             <View className="flex-row items-center mb-2">
               <AlertTriangle size={20} color="#EF4444" />
               <Text className={`ml-2 text-sm font-medium ${
                 isDarkMode ? 'text-red-200' : 'text-red-800'
               }`}>
                 Observações da Sala Suja
               </Text>
             </View>
             <Text className={`text-sm ${
               isDarkMode ? 'text-red-100' : 'text-red-700'
             }`}>
               {observacoesSalaSuja}
             </Text>
           </View>
         )}

         {/* Instruções de Limpeza da Sala */}
         {salaData?.instrucoes && (
           <View className={`mx-4 mb-3 p-4 rounded-xl ${
             isDarkMode ? 'bg-blue-900' : 'bg-blue-50'
           } border ${
             isDarkMode ? 'border-blue-700' : 'border-blue-200'
           }`}>
             <View className="flex-row items-center mb-2">
               <Clock size={20} color="#3B82F6" />
               <Text className={`ml-2 text-sm font-medium ${
                 isDarkMode ? 'text-blue-200' : 'text-blue-800'
               }`}>
                 Instruções de Limpeza
               </Text>
             </View>
             <Text className={`text-sm ${
               isDarkMode ? 'text-blue-100' : 'text-blue-700'
             }`}>
               {salaData.instrucoes}
             </Text>
           </View>
         )}

         {limpezaIniciada && (
           <View className={`mx-4 mb-3 p-4 rounded-xl ${
             isDarkMode ? 'bg-orange-900' : 'bg-orange-50'
           } border ${
             isDarkMode ? 'border-orange-700' : 'border-orange-200'
           }`}>
             <View className="flex-row items-center">
               <AlertTriangle size={20} color="#F59E0B" />
               <Text className={`ml-2 text-sm font-medium ${
                 isDarkMode ? 'text-orange-200' : 'text-orange-800'
               }`}>
                 Limpeza em andamento - Não é possível sair da tela
               </Text>
             </View>
           </View>
         )}

         <View className={`mx-4 mb-3 p-4 rounded-xl ${
           isDarkMode ? 'bg-gray-800' : 'bg-white'
         } shadow-sm border ${
           isDarkMode ? 'border-gray-700' : 'border-gray-200'
         }`}>
           <View className="flex-row items-center mb-3">
             {limpezaIniciada ? (
               <Clock size={20} color="#F59E0B" />
             ) : (
               <Clock size={20} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
             )}
             <Text className={`ml-2 text-sm font-medium ${
               isDarkMode ? 'text-gray-300' : 'text-gray-600'
             }`}>
               {limpezaIniciada ? 'Limpeza em Andamento' : 'Limpeza não Iniciada'}
             </Text>
           </View>

           {limpezaIniciada && inicioLimpeza && (
             <View className={`p-3 rounded-lg ${
               isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
             }`}>
               <Text className={`text-xs font-medium ${
                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}>
                 TEMPO DECORRIDO
               </Text>
               <Text className={`text-sm mt-1 ${
                 isDarkMode ? 'text-gray-200' : 'text-gray-700'
               }`}>
                 {tempoDecorrido}
               </Text>
             </View>
           )}
         </View>

         {!limpezaIniciada && (
           <View className="mx-4 mb-3">
             <TouchableOpacity
               onPress={handleIniciarLimpeza}
               disabled={isLoading}
               className={`p-4 rounded-xl ${
                 isLoading 
                   ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-400')
                   : (isDarkMode ? 'bg-blue-600' : 'bg-blue-500')
               }`}
               activeOpacity={0.8}
             >
               <View className="flex-row items-center justify-center">
                 {isLoading ? (
                   <ActivityIndicator size={20} color="white" />
                 ) : (
                 <Clock size={20} color="white" />
                 )}
                 <Text className="ml-2 text-white text-sm font-semibold">
                   {isLoading ? 'Iniciando...' : 'Iniciar Limpeza'}
                 </Text>
               </View>
             </TouchableOpacity>
           </View>
         )}

         {limpezaIniciada && (
           <View className={`mx-4 mb-3 p-4 rounded-xl ${
             isDarkMode ? 'bg-gray-800' : 'bg-white'
           } shadow-sm border ${
             isDarkMode ? 'border-gray-700' : 'border-gray-200'
           }`}>
             <Text className={`text-sm font-medium mb-2 ${
               isDarkMode ? 'text-gray-300' : 'text-gray-600'
             }`}>
               Observações (Opcional)
             </Text>
             <Text className={`text-xs mb-3 ${
               isDarkMode ? 'text-gray-400' : 'text-gray-500'
             }`}>
               Adicione observações sobre a limpeza realizada:
             </Text>
             
             <TextInput
               value={observacoes}
               onChangeText={setObservacoes}
               placeholder="Ex: Limpeza realizada com atenção aos detalhes, janelas abertas..."
               placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
               multiline
               numberOfLines={4}
               className={`p-3 rounded-lg border ${
                 isDarkMode 
                   ? 'bg-gray-700 border-gray-600 text-white' 
                   : 'bg-gray-50 border-gray-300 text-gray-900'
               }`}
               textAlignVertical="top"
             />
           </View>
         )}

         {limpezaIniciada && (
           <View className={`mx-4 mb-3 p-4 rounded-xl ${
             isDarkMode ? 'bg-gray-800' : 'bg-white'
           } shadow-sm border ${
             isDarkMode ? 'border-gray-700' : 'border-gray-200'
           }`}>
             <View className="flex-row items-center justify-between mb-3">
               <View className="flex-1">
                 <Text className={`text-sm font-medium ${
                   isDarkMode ? 'text-gray-300' : 'text-gray-600'
                 }`}>
                   Fotos da Limpeza (Obrigatório)
                 </Text>
                 <Text className={`text-xs mt-1 ${
                   isDarkMode ? 'text-gray-400' : 'text-gray-500'
                 }`}>
                   Mínimo: 1 foto • Máximo: 3 fotos • Apenas câmera
                 </Text>
               </View>
               <TouchableOpacity
                 onPress={showImageOptions}
                 disabled={isUploadingPhoto || fotosLimpeza.length >= 3}
                 className={`p-2 rounded-lg flex-row items-center ${
                   fotosLimpeza.length >= 3 
                     ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-400')
                     : (isDarkMode ? 'bg-blue-600' : 'bg-blue-500')
                 }`}
                 style={{ opacity: (isUploadingPhoto || fotosLimpeza.length >= 3) ? 0.6 : 1 }}
               >
                 {isUploadingPhoto ? (
                   <ActivityIndicator size={16} color="white" />
                 ) : (
                   <Camera size={16} color="white" />
                 )}
                 <Text className="ml-1 text-white text-xs font-medium">
                   {isUploadingPhoto 
                     ? 'Enviando...' 
                     : fotosLimpeza.length >= 3 
                       ? 'Limite atingido' 
                       : `Adicionar (${fotosLimpeza.length}/3)`
                   }
                 </Text>
               </TouchableOpacity>
             </View>
             
             {fotosLimpeza.length > 0 ? (
               <FlatList
                 data={fotosLimpeza}
                 horizontal
                 showsHorizontalScrollIndicator={false}
                 keyExtractor={(item, index) => `${item}-${index}`}
                 renderItem={({ item, index }) => (
                   <View className="relative mr-3">
                     <Image
                       source={{ uri: item }}
                       className="w-20 h-20 rounded-lg"
                       resizeMode="cover"
                     />
                     <TouchableOpacity
                       onPress={() => removePhoto(index)}
                       className="absolute bg-red-500 rounded-full items-center justify-center"
                       style={{ 
                         width: 24, 
                         height: 24,
                         top: -4,
                         right: -4,
                         shadowColor: '#000',
                         shadowOffset: { width: 0, height: 1 },
                         shadowOpacity: 0.25,
                         shadowRadius: 2,
                         elevation: 3
                       }}
                     >
                       <X size={12} color="white" />
                     </TouchableOpacity>
                   </View>
                 )}
               />
             ) : (
               <Text className={`text-xs text-center py-4 ${
                 isDarkMode ? 'text-gray-400' : 'text-gray-500'
               }`}>
                 Nenhuma foto adicionada ainda
               </Text>
             )}
           </View>
         )}

         {limpezaIniciada && (
           <View className="mx-4 mb-3">
             <TouchableOpacity
               onPress={handleFinalizarLimpeza}
               disabled={isLoading}
               className={`p-4 rounded-xl ${
                 isLoading 
                   ? (isDarkMode ? 'bg-gray-600' : 'bg-gray-400')
                   : (isDarkMode ? 'bg-green-600' : 'bg-green-500')
               }`}
               activeOpacity={0.8}
             >
               <View className="flex-row items-center justify-center">
                 {isLoading ? (
                   <ActivityIndicator size={20} color="white" />
                 ) : (
                   <CheckCircle size={20} color="white" />
                 )}
                 <Text className="ml-2 text-white text-sm font-semibold">
                   {isLoading ? 'Finalizando...' : 'Finalizar Limpeza'}
                 </Text>
               </View>
             </TouchableOpacity>
           </View>
         )}

         <View className={`mx-4 mb-4 p-4 rounded-xl ${
           isDarkMode ? 'bg-gray-800' : 'bg-white'
         } shadow-sm border ${
           isDarkMode ? 'border-gray-700' : 'border-gray-200'
         }`}>
           <Text className={`text-sm font-medium mb-3 ${
             isDarkMode ? 'text-gray-300' : 'text-gray-600'
           }`}>
             Instruções
           </Text>
           <View className="space-y-2">
             <Text className={`text-xs ${
               isDarkMode ? 'text-gray-400' : 'text-gray-500'
             }`}>
               • Clique em "Iniciar Limpeza" para começar o processo
             </Text>
             <Text className={`text-xs ${
               isDarkMode ? 'text-gray-400' : 'text-gray-500'
             }`}>
               • Realize a limpeza da sala conforme necessário
             </Text>
             <Text className={`text-xs ${
               isDarkMode ? 'text-gray-400' : 'text-gray-500'
             }`}>
               • Adicione fotos da limpeza realizada (recomendado)
             </Text>
             <Text className={`text-xs ${
               isDarkMode ? 'text-gray-400' : 'text-gray-500'
             }`}>
               • Adicione observações se necessário (opcional)
             </Text>
             <Text className={`text-xs ${
               isDarkMode ? 'text-gray-400' : 'text-gray-500'
             }`}>
               • Clique em "Finalizar Limpeza" para concluir
             </Text>
           </View>
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

export default LimpezaProcessoScreen;
