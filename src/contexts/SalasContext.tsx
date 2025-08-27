import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Sala, CreateSalaData, UpdateSalaData, LimpezaRegistro, MarcarLimpezaData } from '../types/salas';

interface SalasContextType {
  salas: Sala[];
  isLoading: boolean;
  refreshing: boolean;
  listSalas: () => Promise<{ success: boolean; salas?: Sala[]; error?: string }>;
  createSala: (salaData: CreateSalaData) => Promise<{ success: boolean; sala?: Sala; error?: string }>;
  getSala: (id: number) => Promise<{ success: boolean; sala?: Sala; error?: string }>;
  updateSala: (id: number, salaData: UpdateSalaData) => Promise<{ success: boolean; sala?: Sala; error?: string }>;
  deleteSala: (id: number) => Promise<{ success: boolean; error?: string }>;
  marcarComoLimpa: (id: number, data?: MarcarLimpezaData) => Promise<{ success: boolean; registro?: LimpezaRegistro; error?: string }>;
  listRegistrosLimpeza: (salaId?: number) => Promise<{ success: boolean; registros?: LimpezaRegistro[]; error?: string }>;
}

const SalasContext = createContext<SalasContextType | undefined>(undefined);

export const useSalas = () => {
  const context = useContext(SalasContext);
  if (!context) {
    throw new Error('useSalas must be used within a SalasProvider');
  }
  return context;
};

interface SalasProviderProps {
  children: ReactNode;
}

const BASE_URL = 'https://zeladoria.tsr.net.br/api';

export const SalasProvider: React.FC<SalasProviderProps> = ({ children }) => {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { token } = useAuth();

  const listSalas = async (): Promise<{ success: boolean; salas?: Sala[]; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/salas/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const salasData = await response.json();
        setSalas(salasData);
        return { success: true, salas: salasData };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao listar salas' 
        };
      }
    } catch (error) {
      console.error('List salas error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const createSala = async (salaData: CreateSalaData): Promise<{ success: boolean; sala?: Sala; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch(`${BASE_URL}/salas/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaData),
      });

      if (response.ok) {
        const novaSala = await response.json();
        setSalas(prev => [...prev, novaSala]);
        return { success: true, sala: novaSala };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao criar sala' 
        };
      }
    } catch (error) {
      console.error('Create sala error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const getSala = async (id: number): Promise<{ success: boolean; sala?: Sala; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch(`${BASE_URL}/salas/${id}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const sala = await response.json();
        return { success: true, sala };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao obter sala' 
        };
      }
    } catch (error) {
      console.error('Get sala error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const updateSala = async (id: number, salaData: UpdateSalaData): Promise<{ success: boolean; sala?: Sala; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch(`${BASE_URL}/salas/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaData),
      });

      if (response.ok) {
        const salaAtualizada = await response.json();
        setSalas(prev => prev.map(sala => 
          sala.id === id ? salaAtualizada : sala
        ));
        return { success: true, sala: salaAtualizada };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao atualizar sala' 
        };
      }
    } catch (error) {
      console.error('Update sala error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const deleteSala = async (id: number): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch(`${BASE_URL}/salas/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSalas(prev => prev.filter(sala => sala.id !== id));
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao excluir sala' 
        };
      }
    } catch (error) {
      console.error('Delete sala error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const marcarComoLimpa = async (id: number, data?: MarcarLimpezaData): Promise<{ success: boolean; registro?: LimpezaRegistro; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch(`${BASE_URL}/salas/${id}/marcar_como_limpa/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || {}),
      });

      if (response.ok) {
        const registro = await response.json();
        setSalas(prev => prev.map(sala => 
          sala.id === id ? {
            ...sala,
            status_limpeza: 'Limpa',
            ultima_limpeza_data_hora: registro.data_hora_limpeza,
            ultima_limpeza_funcionario: registro.funcionario_responsavel.username
          } : sala
        ));
        return { success: true, registro };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao marcar sala como limpa' 
        };
      }
    } catch (error) {
      console.error('Marcar como limpa error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const listRegistrosLimpeza = async (salaId?: number): Promise<{ success: boolean; registros?: LimpezaRegistro[]; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      let url = `${BASE_URL}/limpezas/`;
      if (salaId) {
        url += `?sala_id=${salaId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const registros = await response.json();
        return { success: true, registros };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao listar registros de limpeza' 
        };
      }
    } catch (error) {
      console.error('List registros limpeza error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const value: SalasContextType = {
    salas,
    isLoading,
    refreshing,
    listSalas,
    createSala,
    getSala,
    updateSala,
    deleteSala,
    marcarComoLimpa,
    listRegistrosLimpeza,
  };

  return (
    <SalasContext.Provider value={value}>
      {children}
    </SalasContext.Provider>
  );
};

