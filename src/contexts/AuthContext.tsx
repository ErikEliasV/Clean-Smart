import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  username: string;
  email: string;
  is_superuser: boolean;
  groups: number[];
  profile: {
    profile_picture: string | null;
  };
}

// Grupos do sistema
export const USER_GROUPS = {
  ZELADORIA: 1,
  CORPO_DOCENTE: 2,
} as const;

// Funções helper para verificar permissões
export const isAdmin = (user: User | null): boolean => {
  return user?.is_superuser === true;
};

export const isZelador = (user: User | null): boolean => {
  return user?.groups?.includes(USER_GROUPS.ZELADORIA) === true;
};

export const isCorpoDocente = (user: User | null): boolean => {
  return user?.groups?.includes(USER_GROUPS.CORPO_DOCENTE) === true;
};

export const canManageSalas = (user: User | null): boolean => {
  return isAdmin(user) || isZelador(user);
};

export const canViewAllSalas = (user: User | null): boolean => {
  return isAdmin(user) || isZelador(user) || isCorpoDocente(user);
};

interface CreateUserData {
  username: string;
  password: string;
  confirm_password: string;
  email?: string;
  is_superuser?: boolean;
  groups?: number[];
}

interface ChangePasswordData {
  old_password: string;
  new_password: string;
  confirm_new_password: string;
}

interface Group {
  id: number;
  name: string;
}

interface ProfileData {
  profile_picture: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<{ success: boolean; user?: User; error?: string }>;
  listUsers: () => Promise<{ success: boolean; users?: User[]; error?: string }>;
  createUser: (userData: CreateUserData) => Promise<{ success: boolean; user?: User; error?: string }>;
  changePassword: (passwordData: ChangePasswordData) => Promise<{ success: boolean; error?: string }>;
  listGroups: () => Promise<{ success: boolean; groups?: Group[]; error?: string }>;
  getProfile: () => Promise<{ success: boolean; profile?: ProfileData; error?: string }>;
  updateProfile: (imageUri: string | null) => Promise<{ success: boolean; profile?: ProfileData; error?: string }>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadStoredAuth();
    loadTheme();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      
      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        
        if (userData.profile?.profile_picture && !userData.profile.profile_picture.startsWith('http')) {
          userData.profile.profile_picture = `https://zeladoria.tsr.net.br${userData.profile.profile_picture}`;
        }
        
        setToken(storedToken);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTheme = async () => {
    try {
      const theme = await AsyncStorage.getItem('theme');
      setIsDarkMode(theme === 'dark');
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('https://zeladoria.tsr.net.br/api/accounts/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Se a URL da imagem for relativa, converter para absoluta
        if (data.user_data?.profile?.profile_picture && !data.user_data.profile.profile_picture.startsWith('http')) {
          data.user_data.profile.profile_picture = `https://zeladoria.tsr.net.br${data.user_data.profile.profile_picture}`;
        }
        
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user_data));
        
        setToken(data.token);
        setUser(data.user_data);
        
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Credenciais inválidas' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getCurrentUser = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch('https://zeladoria.tsr.net.br/api/accounts/current_user/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const userData = await response.json();
        
        // Se a URL da imagem for relativa, converter para absoluta
        if (userData.profile?.profile_picture && !userData.profile.profile_picture.startsWith('http')) {
          userData.profile.profile_picture = `https://zeladoria.tsr.net.br${userData.profile.profile_picture}`;
        }
        
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return { success: true, user: userData };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao obter dados do usuário' 
        };
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const listUsers = async (): Promise<{ success: boolean; users?: User[]; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch('https://zeladoria.tsr.net.br/api/accounts/list_users/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const users = await response.json();
        return { success: true, users };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao listar usuários' 
        };
      }
    } catch (error) {
      console.error('List users error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const createUser = async (userData: CreateUserData): Promise<{ success: boolean; user?: User; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch('https://zeladoria.tsr.net.br/api/accounts/create_user/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao criar usuário' 
        };
      }
    } catch (error) {
      console.error('Create user error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const changePassword = async (passwordData: ChangePasswordData): Promise<{ success: boolean; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch('https://zeladoria.tsr.net.br/api/accounts/change_password/', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao alterar senha' 
        };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const listGroups = async (): Promise<{ success: boolean; groups?: Group[]; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch('https://zeladoria.tsr.net.br/api/accounts/list_groups/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const groups = await response.json();
        return { success: true, groups };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao listar grupos' 
        };
      }
    } catch (error) {
      console.error('List groups error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const getProfile = async (): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      const response = await fetch('https://zeladoria.tsr.net.br/api/accounts/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const profile = await response.json();
        
        // Se a URL da imagem for relativa, converter para absoluta
        if (profile.profile_picture && !profile.profile_picture.startsWith('http')) {
          profile.profile_picture = `https://zeladoria.tsr.net.br${profile.profile_picture}`;
        }
        
        return { success: true, profile };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao obter perfil' 
        };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const updateProfile = async (imageUri: string | null): Promise<{ success: boolean; profile?: ProfileData; error?: string }> => {
    if (!token) {
      return { success: false, error: 'Token não encontrado' };
    }

    try {
      let response;
      
      if (imageUri) {
        // Upload de nova imagem
        const formData = new FormData();
        formData.append('profile_picture', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'profile_picture.jpg',
        } as any);

        response = await fetch('https://zeladoria.tsr.net.br/api/accounts/profile/', {
          method: 'PUT',
          headers: {
            'Authorization': `Token ${token}`,
            // Não definir Content-Type para FormData - o React Native define automaticamente
          },
          body: formData,
        });
      } else {
        // Remover imagem
        response = await fetch('https://zeladoria.tsr.net.br/api/accounts/profile/', {
          method: 'PUT',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ profile_picture: null }),
        });
      }

      if (response.ok) {
        const profile = await response.json();
        
        // Se a URL da imagem for relativa, converter para absoluta
        if (profile.profile_picture && !profile.profile_picture.startsWith('http')) {
          profile.profile_picture = `https://zeladoria.tsr.net.br${profile.profile_picture}`;
        }
        
        // Atualizar o usuário local com a nova foto
        if (user) {
          const updatedUser = { ...user, profile };
          setUser(updatedUser);
          await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return { success: true, profile };
      } else {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.message || 'Erro ao atualizar perfil' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: 'Erro de conexão. Verifique sua internet.' 
      };
    }
  };

  const isAdmin = (): boolean => {
    return user?.is_superuser || false;
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isDarkMode,
    toggleTheme,
    login,
    logout,
    getCurrentUser,
    listUsers,
    createUser,
    changePassword,
    listGroups,
    getProfile,
    updateProfile,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
