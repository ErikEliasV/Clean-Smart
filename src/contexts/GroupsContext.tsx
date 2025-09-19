import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';

const BASE_URL = 'https://zeladoria.tsr.net.br/api';

export interface Group {
  id: number;
  name: string;
}

interface GroupsContextType {
  groups: Group[];
  isLoading: boolean;
  carregarGrupos: () => Promise<void>;
  getGroupName: (groupId: number) => string;
  getGroupById: (groupId: number) => Group | undefined;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

export const GroupsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const carregarGrupos = useCallback(async (): Promise<void> => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/accounts/list_groups/`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      } else {
        console.error('Erro ao carregar grupos:', response.status);
      }
    } catch (error) {
      console.error('Erro de conexão ao carregar grupos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const getGroupName = useCallback((groupId: number): string => {
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Grupo Desconhecido';
  }, [groups]);

  const getGroupById = useCallback((groupId: number): Group | undefined => {
    return groups.find(g => g.id === groupId);
  }, [groups]);

  const value: GroupsContextType = {
    groups,
    isLoading,
    carregarGrupos,
    getGroupName,
    getGroupById,
  };

  return (
    <GroupsContext.Provider value={value}>
      {children}
    </GroupsContext.Provider>
  );
};

export const useGroups = () => {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
};
