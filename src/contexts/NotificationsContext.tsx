import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

const BASE_URL = 'https://zeladoria.tsr.net.br/api';

export interface Notificacao {
  id: number;
  mensagem: string;
  link: string;
  data_criacao: string;
  lida: boolean;
}

interface NotificationsContextType {
  notificacoes: Notificacao[];
  notificacoesNaoLidas: number;
  isLoading: boolean;
  carregarNotificacoes: () => Promise<void>;
  marcarComoLida: (id: number) => Promise<boolean>;
  marcarTodasComoLidas: () => Promise<boolean>;
  refreshNotificacoes: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).length;

  const carregarNotificacoes = useCallback(async (): Promise<void> => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/notificacoes/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotificacoes(data);
      } else {
        console.error('Erro ao carregar notificações:', response.status);
      }
    } catch (error) {
      console.error('Erro de conexão ao carregar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const marcarComoLida = useCallback(async (id: number): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await fetch(`${BASE_URL}/notificacoes/${id}/marcar_como_lida/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok || response.status === 204) {
        setNotificacoes(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, lida: true } : notif
          )
        );
        return true;
      } else {
        console.error('Erro ao marcar notificação como lida:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Erro de conexão ao marcar notificação como lida:', error);
      return false;
    }
  }, [token]);

  const marcarTodasComoLidas = useCallback(async (): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await fetch(`${BASE_URL}/notificacoes/marcar_todas_como_lidas/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok || response.status === 204) {
        setNotificacoes(prev => 
          prev.map(notif => ({ ...notif, lida: true }))
        );
        return true;
      } else {
        console.error('Erro ao marcar todas as notificações como lidas:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Erro de conexão ao marcar todas as notificações como lidas:', error);
      return false;
    }
  }, [token]);

  const refreshNotificacoes = useCallback(async (): Promise<void> => {
    await carregarNotificacoes();
  }, [carregarNotificacoes]);

  const value: NotificationsContextType = {
    notificacoes,
    notificacoesNaoLidas,
    isLoading,
    carregarNotificacoes,
    marcarComoLida,
    marcarTodasComoLidas,
    refreshNotificacoes,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
