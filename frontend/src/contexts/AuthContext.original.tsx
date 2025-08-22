import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  User, 
  AuthContextType, 
  LoginCredentials, 
  UserRegistrationData 
} from '../types';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

// Estado inicial
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
};

// Acções do reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'LOGOUT' };

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { 
        ...state, 
        user: action.payload,
        isAuthenticated: !!action.payload 
      };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
}

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        if (apiService.isAuthenticated()) {
          let user = apiService.getCurrentUser();
          if (user) {
            // Garantir que user_type está presente
            if (!user.user_type) {
              user.user_type = 'viewer';
              localStorage.setItem('user', JSON.stringify(user));
            }
            // Verificar se o token ainda é válido fazendo uma requisição ao perfil
            try {
              const response = await apiService.getProfile();
              if (response.sucesso) {
                let backendUser = response.dados;
                if (!backendUser.user_type) {
                  backendUser.user_type = 'viewer';
                }
                localStorage.setItem('user', JSON.stringify(backendUser));
                dispatch({ type: 'SET_USER', payload: backendUser });
              } else {
                apiService.logout();
                dispatch({ type: 'LOGOUT' });
              }
            } catch (error) {
              apiService.logout();
              dispatch({ type: 'LOGOUT' });
            }
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        dispatch({ type: 'LOGOUT' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    checkAuth();
  }, []);

  // Função de login
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.login(credentials);
      if (response.sucesso) {
        let user = response.dados.user;
        if (!user.user_type) {
          user.user_type = 'viewer';
        }
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'SET_USER', payload: user });
        toast.success(response.mensagem || 'Sessão iniciada com sucesso!');
        return true;
      } else {
        toast.error(response.mensagem || 'Erro ao iniciar sessão.');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao iniciar sessão.');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Função de registo
  const register = async (userData: UserRegistrationData): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await apiService.register(userData);
      
      if (response.sucesso) {
        toast.success(response.mensagem || 'Conta criada com sucesso! Pode agora iniciar sessão.');
        return true;
      } else {
        toast.error(response.mensagem || 'Erro ao criar conta.');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta.');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Função de logout
  const logout = () => {
    apiService.logout();
    dispatch({ type: 'LOGOUT' });
    toast.success('Sessão terminada com sucesso.');
  };

  // Função para actualizar perfil
  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await apiService.updateProfile(userData);
      if (response.sucesso) {
        let user = response.dados;
        if (!user.user_type) {
          user.user_type = 'viewer';
        }
        dispatch({ type: 'SET_USER', payload: user });
        localStorage.setItem('user', JSON.stringify(user));
        toast.success(response.mensagem || 'Perfil actualizado com sucesso!');
        return true;
      } else {
        toast.error(response.mensagem || 'Erro ao actualizar perfil.');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao actualizar perfil.');
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Valor do contexto
  const value: AuthContextType = {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
