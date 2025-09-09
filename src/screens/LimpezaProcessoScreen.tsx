import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ChevronLeft, CheckCircle, Clock } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSalas } from '../contexts/SalasContext';
import { SENAC_COLORS } from '../constants/colors';
import { StackScreenProps } from '@react-navigation/stack';
import { SalasStackParamList } from '../types/navigation';

type LimpezaProcessoScreenProps = StackScreenProps<SalasStackParamList, 'LimpezaProcesso'>;

const LimpezaProcessoScreen: React.FC<LimpezaProcessoScreenProps> = ({ navigation, route }) => {
  const { isDarkMode, user } = useAuth();
  const { marcarComoLimpa } = useSalas();
  const [observacoes, setObservacoes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limpezaIniciada, setLimpezaIniciada] = useState(false);
  const [inicioLimpeza, setInicioLimpeza] = useState<Date | null>(null);
  const [tempoDecorrido, setTempoDecorrido] = useState('0:00');

  const { salaId, salaNome } = route.params;

  // Timer para atualizar o tempo decorrido
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

  const handleIniciarLimpeza = () => {
    setLimpezaIniciada(true);
    setInicioLimpeza(new Date());
    Alert.alert(
      'Limpeza Iniciada',
      'A limpeza foi iniciada. Quando terminar, clique em "Finalizar Limpeza" para concluir o processo.',
      [{ text: 'OK' }]
    );
  };

  const handleFinalizarLimpeza = async () => {
    if (!salaId) {
      Alert.alert('Erro', 'ID da sala não encontrado');
      return;
    }

    setIsLoading(true);
    try {
      const data = observacoes.trim() ? { observacoes: observacoes.trim() } : {};
      const result = await marcarComoLimpa(salaId, data);
      
      if (result.success) {
        Alert.alert(
          'Sucesso',
          'Limpeza finalizada com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Erro', result.error || 'Erro ao finalizar limpeza');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao finalizar limpeza');
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
          Processo de Limpeza
        </Text>
        
        <View style={{ width: 40 }} />
      </View>

             <ScrollView className="flex-1">
         {/* Informações da Sala */}
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

         {/* Status da Limpeza */}
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

         {/* Botão Iniciar Limpeza */}
         {!limpezaIniciada && (
           <View className="mx-4 mb-3">
             <TouchableOpacity
               onPress={handleIniciarLimpeza}
               className={`p-4 rounded-xl ${
                 isDarkMode ? 'bg-blue-600' : 'bg-blue-500'
               }`}
               activeOpacity={0.8}
             >
               <View className="flex-row items-center justify-center">
                 <Clock size={20} color="white" />
                 <Text className="ml-2 text-white text-sm font-semibold">
                   Iniciar Limpeza
                 </Text>
               </View>
             </TouchableOpacity>
           </View>
         )}

         {/* Área de Observações */}
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

         {/* Botão Finalizar Limpeza */}
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

         {/* Instruções */}
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
    </View>
  );
};

export default LimpezaProcessoScreen;
