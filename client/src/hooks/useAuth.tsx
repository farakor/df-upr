import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, AuthState, LoginCredentials, AuthResponse } from '@/types/auth';
import { authApi } from '@/services/api/auth';
import { tokenStorage } from '@/services/storage/tokenStorage';
import toast from 'react-hot-toast';

// Типы действий
type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: AuthResponse }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'REFRESH_TOKEN_SUCCESS'; payload: { accessToken: string; refreshToken: string } }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

// Начальное состояние
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

// Reducer для управления состоянием аутентификации
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'REFRESH_TOKEN_SUCCESS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
      };

    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Контекст аутентификации
interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер аутентификации
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Инициализация при загрузке приложения
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const tokens = tokenStorage.getTokens();
        
        if (tokens.accessToken && tokens.refreshToken) {
          // Проверяем валидность токена
          try {
            const user = await authApi.getProfile();
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                user,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
              },
            });
          } catch (error) {
            // Токен недействителен, пытаемся обновить
            const refreshSuccess = await refreshToken();
            if (!refreshSuccess) {
              tokenStorage.clearTokens();
              dispatch({ type: 'LOGOUT' });
            }
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Ошибка инициализации аутентификации:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Сохранение токенов при изменении состояния
  useEffect(() => {
    if (state.accessToken && state.refreshToken) {
      tokenStorage.setTokens({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      });
    }
  }, [state.accessToken, state.refreshToken]);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authApi.login(credentials);
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
      
      toast.success(`Добро пожаловать, ${response.user.firstName}!`);
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      
      const errorMessage = error.response?.data?.error?.message || 'Ошибка входа в систему';
      toast.error(errorMessage);
      
      throw error;
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();
    dispatch({ type: 'LOGOUT' });
    toast.success('Вы успешно вышли из системы');
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const tokens = tokenStorage.getTokens();
      
      if (!tokens.refreshToken) {
        return false;
      }

      const response = await authApi.refreshToken(tokens.refreshToken);
      
      dispatch({
        type: 'REFRESH_TOKEN_SUCCESS',
        payload: response,
      });
      
      return true;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      return false;
    }
  };

  const updateUser = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const contextValue: AuthContextType = {
    state,
    login,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Хук для использования контекста аутентификации
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  
  return context;
};
