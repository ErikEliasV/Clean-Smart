import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Sala, CreateSalaData, UpdateSalaData, LimpezaRegistro, MarcarLimpezaData, IniciarLimpezaResponse, ConcluirLimpezaData, MarcarSujaData, FotoLimpeza } from '../types/salas';

interface SalasContextType {
  salas: Sala[];
  isLoading: boolean;
  refreshing: boolean;
  listSalas: () => Promise<{ success: boolean; salas?: Sala[]; error?: string }>;
  createSala: (salaData: CreateSalaData) => Promise<{ success: boolean; sala?: Sala; error?: string }>;
  getSala: (qrCodeId: string) => Promise<{ success: boolean; sala?: Sala; error?: string }>;
  updateSala: (qrCodeId: string, salaData: UpdateSalaData) => Promise<{ success: boolean; sala?: Sala; error?: string }>;
  deleteSala: (qrCodeId: string) => Promise<{ success: boolean; error?: string }>;
  iniciarLimpeza: (qrCodeId: string) => Promise<{ success: boolean; registro?: IniciarLimpezaResponse; error?: string }>;
  concluirLimpeza: (qrCodeId: string, data?: ConcluirLimpezaData) => Promise<{ success: boolean; registro?: LimpezaRegistro; error?: string }>;
  marcarComoSuja: (qrCodeId: string, data?: MarcarSujaData) => Promise<{ success: boolean; error?: string }>;
  marcarComoLimpa: (qrCodeId: string, data?: MarcarLimpezaData) => Promise<{ success: boolean; registro?: LimpezaRegistro; error?: string }>;
  uploadFotoLimpeza: (registroLimpezaId: number, imageUri: string) => Promise<{ success: boolean; foto?: FotoLimpeza; error?: string }>;
  uploadImagemSala: (qrCodeId: string, imageUri: string) => Promise<{ success: boolean; imageUrl?: string; error?: string }>;
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
      const formData = new FormData();
      
      formData.append('nome_numero', salaData.nome_numero);
      formData.append('capacidade', salaData.capacidade.toString());
      formData.append('localizacao', salaData.localizacao);
      
      if (salaData.validade_limpeza_horas) {
        formData.append('validade_limpeza_horas', salaData.validade_limpeza_horas.toString());
      }
      if (salaData.descricao) {
        formData.append('descricao', salaData.descricao);
      }
      if (salaData.instrucoes) {
        formData.append('instrucoes', salaData.instrucoes);
      }
      if (salaData.responsaveis && salaData.responsaveis.length > 0) {
        salaData.responsaveis.forEach(responsavel => {
          formData.append('responsaveis', responsavel);
        });
      }
      
      if (salaData.imagem) {
        formData.append('imagem', {
          uri: salaData.imagem.uri,
          type: 'image/jpeg',
          name: 'sala_image.jpg',
        } as any);
      }

      const response = await fetch(`${BASE_URL}/salas/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      
      if (response.ok) {
        try {
          const responseText = await response.text();
          const novaSala = JSON.parse(responseText);
          setSalas(prev => [...prev, novaSala]);
          return { success: true, sala: novaSala };
        } catch (jsonError) {
          console.error('Create sala JSON parse error:', jsonError);
          return {
            success: false,
            error: 'Erro ao processar resposta do servidor.'
          };
        }
      } else if (response.status === 500) {
        console.log('Erro 500 recebido, verificando se sala foi criada...');
        try {
          const salasResponse = await fetch(`${BASE_URL}/salas/`, {
            method: 'GET',
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (salasResponse.ok) {
            const salasData = await salasResponse.json();
            const salaCriada = salasData.find((s: any) => s.nome_numero === salaData.nome_numero);
            
            if (salaCriada) {
              console.log('Sala foi criada mesmo com erro 500:', salaCriada);
              setSalas(prev => [...prev, salaCriada]);
              return { success: true, sala: salaCriada };
            }
          }
        } catch (error) {
          console.error('Erro ao verificar se sala foi criada:', error);
        }
        
        return {
          success: false,
          error: 'Erro interno do servidor (500). Tente novamente.'
        };
      } else {
        try {
          const responseText = await response.text();
          const errorData = JSON.parse(responseText);
          return { 
            success: false, 
            error: errorData.detail || errorData.message || 'Erro ao criar sala' 
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
      console.log('=== UPDATE SALA DEBUG ===');
      console.log('qrCodeId:', qrCodeId);
      console.log('salaData recebido:', salaData);
      
      console.log('Usando FormData para atualização (conforme documentação)');
      const formData = new FormData();
      
      if (salaData.nome_numero !== undefined) {
        formData.append('nome_numero', salaData.nome_numero);
      }
      if (salaData.capacidade !== undefined) {
        formData.append('capacidade', salaData.capacidade.toString());
      }
      if (salaData.localizacao !== undefined) {
        formData.append('localizacao', salaData.localizacao);
      }
      if (salaData.validade_limpeza_horas !== undefined) {
        formData.append('validade_limpeza_horas', salaData.validade_limpeza_horas.toString());
      }
      if (salaData.descricao !== undefined) {
        formData.append('descricao', salaData.descricao);
      }
      if (salaData.instrucoes !== undefined) {
        formData.append('instrucoes', salaData.instrucoes);
      }
      if (salaData.responsaveis !== undefined) {
        if (salaData.responsaveis.length > 0) {
          salaData.responsaveis.forEach(responsavel => {
            formData.append('responsaveis', responsavel);
          });
        }
      }
      if (salaData.status_limpeza !== undefined) {
        formData.append('status_limpeza', salaData.status_limpeza);
      }
      
      if (salaData.imagem !== undefined) {
        if (salaData.imagem === null) {
          console.log('Removendo imagem (enviando campo vazio)');
          formData.append('imagem', '');
        } else if (salaData.imagem) {
          console.log('Adicionando nova imagem:', salaData.imagem);
          formData.append('imagem', {
            uri: salaData.imagem.uri,
            type: 'image/jpeg',
            name: 'sala_image.jpg',
          } as any);
        }
      }

      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });


      if (response.ok) {
        try {
          const responseText = await response.text();
          const salaAtualizada = JSON.parse(responseText);
          console.log('Sala atualizada com sucesso:', salaAtualizada);
          setSalas(prev => prev.map(sala => 
            sala.qr_code_id === qrCodeId ? salaAtualizada : sala
          ));
          return { success: true, sala: salaAtualizada };
        } catch (jsonError) {
          console.error('Update sala JSON parse error:', jsonError);
          console.error('Response que causou erro:', await response.text());
          return {
            success: false,
            error: 'Erro ao processar resposta do servidor.'
          };
        }
      } else {
        try {
          const responseText = await response.text();
          const errorData = JSON.parse(responseText);
          return { 
            success: false, 
            error: errorData.detail || errorData.message || 'Erro ao atualizar sala' 
          };
        } catch (jsonError) {
          console.error('Update sala error JSON parse error:', jsonError);
          console.error('Response que causou erro:', await response.text());
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

  const iniciarLimpeza = async (qrCodeId: string): Promise<{ success: boolean; registro?: IniciarLimpezaResponse; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      
      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/iniciar_limpeza/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      

      if (response.ok || response.status === 201) {
        try {
          const registro = await response.json();
          setSalas(prev => prev.map(sala => 
            sala.qr_code_id === qrCodeId ? {
              ...sala,
              status_limpeza: 'Em Limpeza'
            } : sala
          ));
          return { success: true, registro };
        } catch (jsonError) {
          console.error('Iniciar limpeza JSON parse error:', jsonError);
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
            error: errorData.detail || errorData.message || 'Erro ao iniciar limpeza' 
          };
        } catch (jsonError) {
          console.error('Iniciar limpeza error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao iniciar limpeza (${response.status}). Resposta inválida do servidor.`
          };
        }
      }
    } catch (error) {
      console.error('Iniciar limpeza error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const concluirLimpeza = async (qrCodeId: string, data?: ConcluirLimpezaData): Promise<{ success: boolean; registro?: LimpezaRegistro; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      
      const formData = new FormData();
      
      if (data?.observacoes) {
        formData.append('observacoes', data.observacoes);
      }
      
      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/concluir_limpeza/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });
      

      if (response.ok) {
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
          console.error('Concluir limpeza JSON parse error:', jsonError);
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
            error: errorData.detail || errorData.message || 'Erro ao concluir limpeza' 
          };
        } catch (jsonError) {
          console.error('Concluir limpeza error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao concluir limpeza (${response.status}). Resposta inválida do servidor.`
          };
        }
      }
    } catch (error) {
      console.error('Concluir limpeza error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const marcarComoSuja = async (qrCodeId: string, data?: MarcarSujaData): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const requestBody: any = {};
      if (data) {
        if (data.observacoes) requestBody.observacoes = data.observacoes;
      }
      
      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/marcar_como_suja/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: Object.keys(requestBody).length > 0 ? JSON.stringify(requestBody) : undefined,
      });

      if (response.ok || response.status === 201) {
        setSalas(prev => prev.map(sala => 
          sala.qr_code_id === qrCodeId ? {
            ...sala,
            status_limpeza: 'Suja'
          } : sala
        ));
        return { success: true };
      } else {
        try {
          const errorData = await response.json();
          return { 
            success: false, 
            error: errorData.detail || errorData.message || 'Erro ao marcar sala como suja' 
          };
        } catch (jsonError) {
          console.error('Marcar como suja error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao marcar sala como suja (${response.status}). Resposta inválida do servidor.`
          };
        }
      }
    } catch (error) {
      console.error('Marcar como suja error:', error);
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
      const formData = new FormData();
      if (data) {
        if (data.observacoes) formData.append('observacoes', data.observacoes);
      }
      
      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/marcar_como_limpa/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

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

  const uploadFotoLimpeza = async (registroLimpezaId: number, imageUri: string): Promise<{ success: boolean; foto?: FotoLimpeza; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      
      const formData = new FormData();
      formData.append('registro_limpeza', registroLimpezaId.toString());
      
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'foto_limpeza.jpg',
      } as any;
      
      formData.append('imagem', imageFile);


      const response = await fetch(`${BASE_URL}/fotos_limpeza/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });


      if (response.ok || response.status === 201) {
        try {
          const foto = await response.json();
          return { success: true, foto };
        } catch (jsonError) {
          console.error('Upload foto limpeza JSON parse error:', jsonError);
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
            error: errorData.detail || errorData.message || 'Erro ao fazer upload da foto' 
          };
        } catch (jsonError) {
          console.error('Upload foto limpeza error JSON parse error:', jsonError);
          return {
            success: false,
            error: `Erro ao fazer upload da foto (${response.status}). Resposta inválida do servidor.`
          };
        }
      }
    } catch (error) {
      console.error('Upload foto limpeza error:', error);
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
      const url = `${BASE_URL}/limpezas/`;

      console.log('=== LIST REGISTROS LIMPEZA DEBUG ===');
      console.log('salaId (para filtro frontend):', salaId);
      console.log('URL:', url);

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
          console.log('Registros recebidos da API:', registros);
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

  const uploadImagemSala = async (qrCodeId: string, imageUri: string): Promise<{ success: boolean; imageUrl?: string; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      
      const formData = new FormData();
      formData.append('imagem', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'sala_image.jpg',
      } as any);


      const response = await fetch(`${BASE_URL}/salas/${qrCodeId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });


      if (response.ok) {
        const responseText = await response.text();
        console.log('Imagem da sala uploadada com sucesso');
        
        await listSalas();
        
        return { success: true, imageUrl: imageUri };
      } else {
        const responseText = await response.text();
        try {
          const errorData = JSON.parse(responseText);
          return { 
            success: false, 
            error: errorData.detail || errorData.message || 'Erro ao fazer upload da imagem da sala' 
          };
        } catch {
          return { 
            success: false, 
            error: 'Erro ao fazer upload da imagem da sala' 
          };
        }
      }
    } catch (error) {
      console.error('Upload imagem sala error:', error);
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
    iniciarLimpeza,
    concluirLimpeza,
    marcarComoSuja,
    marcarComoLimpa,
    uploadFotoLimpeza,
    uploadImagemSala,
    listRegistrosLimpeza,
  };

  return (
    <SalasContext.Provider value={value}>
      {children}
    </SalasContext.Provider>
  );
};

