import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Sala, CreateSalaData, UpdateSalaData, LimpezaRegistro, MarcarLimpezaData } from '../types/salas';

interface SalasContextType {
  salas: Sala[];
  isLoading: boolean;
  refreshing: boolean;
  listSalas: () => Promise<{ success: boolean; salas?: Sala[]; error?: string }>;
  createSala: (salaData: CreateSalaData) => Promise<{ success: boolean; sala?: Sala; error?: string }>;
  getSala: (qrCodeId: string) => Promise<{ success: boolean; sala?: Sala; error?: string }>;
  updateSala: (qrCodeId: string, salaData: UpdateSalaData) => Promise<{ success: boolean; sala?: Sala; error?: string }>;
  deleteSala: (qrCodeId: string) => Promise<{ success: boolean; error?: string }>;
  marcarComoLimpa: (qrCodeId: string, data?: MarcarLimpezaData) => Promise<{ success: boolean; registro?: LimpezaRegistro; error?: string }>;
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
        try {
          const salasData = await response.json();
          setSalas(salasData);
          return { success: true, salas: salasData };
        } catch (jsonError) {
          console.error('List salas JSON parse error:', jsonError);
          return {
            success: false,
            error: 'Erro ao processar resposta do servidor.'
          };
        }
      } else {
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Erro ao listar salas' 
          };
        } catch (jsonError) {
          console.error('List salas error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao listar salas (${response.status}). Resposta inválida do servidor.`
          };
        }
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
        try {
          const novaSala = await response.json();
          setSalas(prev => [...prev, novaSala]);
          return { success: true, sala: novaSala };
        } catch (jsonError) {
          console.error('Create sala JSON parse error:', jsonError);
          return {
            success: false,
            error: 'Erro ao processar resposta do servidor.'
          };
        }
      } else {
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Erro ao criar sala' 
          };
        } catch (jsonError) {
          console.error('Create sala error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao criar sala (${response.status}). Resposta inválida do servidor.`
          };
        }
      }
    } catch (error) {
      console.error('Create sala error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const getSala = async (qrCodeId: string): Promise<{ success: boolean; sala?: Sala; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        try {
          const sala = await response.json();
          return { success: true, sala };
        } catch (jsonError) {
          console.error('Get sala JSON parse error:', jsonError);
          return {
            success: false,
            error: 'Erro ao processar resposta do servidor.'
          };
        }
      } else {
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Erro ao obter sala' 
          };
        } catch (jsonError) {
          console.error('Get sala error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao obter sala (${response.status}). Resposta inválida do servidor.`
          };
        }
      }
    } catch (error) {
      console.error('Get sala error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const updateSala = async (qrCodeId: string, salaData: UpdateSalaData): Promise<{ success: boolean; sala?: Sala; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salaData),
      });

      if (response.ok) {
        try {
          const salaAtualizada = await response.json();
          setSalas(prev => prev.map(sala => 
            sala.qr_code_id === qrCodeId ? salaAtualizada : sala
          ));
          return { success: true, sala: salaAtualizada };
        } catch (jsonError) {
          console.error('Update sala JSON parse error:', jsonError);
          return {
            success: false,
            error: 'Erro ao processar resposta do servidor.'
          };
        }
      } else {
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Erro ao atualizar sala' 
          };
        } catch (jsonError) {
          console.error('Update sala error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao atualizar sala (${response.status}). Resposta inválida do servidor.`
          };
        }
      }
    } catch (error) {
      console.error('Update sala error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const deleteSala = async (qrCodeId: string): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSalas(prev => prev.filter(sala => sala.qr_code_id !== qrCodeId));
        return { success: true };
      } else {
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Erro ao excluir sala' 
          };
        } catch (jsonError) {
          console.error('Delete sala error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao excluir sala (${response.status}). Resposta inválida do servidor.`
          };
        }
      }
    } catch (error) {
      console.error('Delete sala error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const marcarComoLimpa = async (qrCodeId: string, data?: MarcarLimpezaData): Promise<{ success: boolean; registro?: LimpezaRegistro; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/marcar_como_limpa/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data || {}),
      });

      // Verificar se a resposta é JSON válido antes de tentar fazer parse
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Marcar como limpa error: Response is not JSON. Status:', response.status, 'Content-Type:', contentType);
        return {
          success: false,
          error: `Erro no servidor (${response.status}). A resposta não é um JSON válido.`
        };
      }

      if (response.ok || response.status === 201) {
        try {
          const registro = await response.json();
          setSalas(prev => prev.map(sala => 
            sala.qr_code_id === qrCodeId ? {
              ...sala,
              status_limpeza: 'Limpa',
              ultima_limpeza_data_hora: registro.data_hora_limpeza,
              ultima_limpeza_funcionario: registro.funcionario_responsavel.username
            } : sala
          ));
          return { success: true, registro };
        } catch (jsonError) {
          console.error('Marcar como limpa JSON parse error:', jsonError);
          return {
            success: false,
            error: 'Erro ao processar resposta do servidor.'
          };
        }
      } else {
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || `Erro ao marcar sala como limpa (${response.status})` 
          };
        } catch (jsonError) {
          console.error('Marcar como limpa error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao marcar sala como limpa (${response.status}). Resposta inválida do servidor.`
          };
        }
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
        url += `?sala=${salaId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        try {
          const registros = await response.json();
          return { success: true, registros };
        } catch (jsonError) {
          console.error('List registros limpeza JSON parse error:', jsonError);
          return {
            success: false,
            error: 'Erro ao processar resposta do servidor.'
          };
        }
      } else {
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.message || 'Erro ao listar registros de limpeza' 
          };
        } catch (jsonError) {
          console.error('List registros limpeza error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao listar registros de limpeza (${response.status}). Resposta inválida do servidor.`
          };
        }
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

