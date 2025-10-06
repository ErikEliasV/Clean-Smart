import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

interface LimpezaEmAndamento {
  salaId: string;
  salaNome: string;
  registroLimpezaId: number;
  inicioLimpeza: string;
}

interface LimpezaContextType {
  limpezaEmAndamento: boolean;
  dadosLimpeza: LimpezaEmAndamento | null;
  iniciarProcessoLimpeza: (salaId: string, salaNome: string, registroLimpezaId: number) => Promise<void>;
  finalizarProcessoLimpeza: () => Promise<void>;
  verificarLimpezaEmAndamento: () => Promise<boolean>;
}

const LimpezaContext = createContext<LimpezaContextType | undefined>(undefined);

export const useLimpeza = () => {
  const context = useContext(LimpezaContext);
  if (!context) {
    throw new Error('useLimpeza must be used within a LimpezaProvider');
  }
  return context;
};

interface LimpezaProviderProps {
  children: ReactNode;
}

const LIMPEZA_STORAGE_KEY = '@zela_limpeza_em_andamento';

export const LimpezaProvider: React.FC<LimpezaProviderProps> = ({ children }) => {
  const [limpezaEmAndamento, setLimpezaEmAndamento] = useState(false);
  const [dadosLimpeza, setDadosLimpeza] = useState<LimpezaEmAndamento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { handleTokenError } = useAuth();

  useEffect(() => {
    carregarLimpezaDoStorage();
  }, []);

  const carregarLimpezaDoStorage = async () => {
    try {
      const limpezaJSON = await AsyncStorage.getItem(LIMPEZA_STORAGE_KEY);
      if (limpezaJSON) {
        const limpeza: LimpezaEmAndamento = JSON.parse(limpezaJSON);
        setDadosLimpeza(limpeza);
        setLimpezaEmAndamento(true);
        console.log('✅ Limpeza em andamento carregada do storage:', limpeza);
      } else {
        console.log('ℹ️ Nenhuma limpeza em andamento encontrada');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar limpeza do storage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const iniciarProcessoLimpeza = async (
    salaId: string,
    salaNome: string,
    registroLimpezaId: number
  ): Promise<void> => {
    try {
      const limpeza: LimpezaEmAndamento = {
        salaId,
        salaNome,
        registroLimpezaId,
        inicioLimpeza: new Date().toISOString(),
      };

      await AsyncStorage.setItem(LIMPEZA_STORAGE_KEY, JSON.stringify(limpeza));
      setDadosLimpeza(limpeza);
      setLimpezaEmAndamento(true);
      console.log('✅ Limpeza iniciada e salva no storage:', limpeza);
    } catch (error) {
      console.error('❌ Erro ao salvar limpeza no storage:', error);
      throw error;
    }
  };

  const finalizarProcessoLimpeza = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(LIMPEZA_STORAGE_KEY);
      setDadosLimpeza(null);
      setLimpezaEmAndamento(false);
      console.log('✅ Limpeza finalizada e removida do storage');
    } catch (error) {
      console.error('❌ Erro ao remover limpeza do storage:', error);
      if (error instanceof Error && error.message.includes('token')) {
        await handleTokenError();
      }
      throw error;
    }
  };

  const verificarLimpezaEmAndamento = async (): Promise<boolean> => {
    try {
      const limpezaJSON = await AsyncStorage.getItem(LIMPEZA_STORAGE_KEY);
      return limpezaJSON !== null;
    } catch (error) {
      console.error('❌ Erro ao verificar limpeza:', error);
      return false;
    }
  };

  const value: LimpezaContextType = {
    limpezaEmAndamento,
    dadosLimpeza,
    iniciarProcessoLimpeza,
    finalizarProcessoLimpeza,
    verificarLimpezaEmAndamento,
  };

  if (isLoading) {
    return null;
  }

  return (
    <LimpezaContext.Provider value={value}>
      {children}
    </LimpezaContext.Provider>
  );
};

