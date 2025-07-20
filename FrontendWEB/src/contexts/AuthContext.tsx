import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { ApiEndpoints, LocalStorageKeys } from '../utils/constants';

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  mobileNumber?: string;
  bio?: string;
  profilePicture?: string;
}

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  error: string | null;
}

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: User | null;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  googleSignIn: (googleData: any) => Promise<boolean>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  sendVerificationEmail: (email: string) => Promise<boolean>;
  fetchUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  isLoading: false,
  isAuthenticated: false,
  token: null,
  user: null,
  error: null,
};

type AuthAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTHENTICATED'; payload: boolean }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_AUTHENTICATED':
      return { ...state, isAuthenticated: action.payload };
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        error: null,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        token: null,
        user: null,
        error: null,
        isLoading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem(LocalStorageKeys.TOKEN);
    const userData = localStorage.getItem(LocalStorageKeys.USER);

    if (token && userData) {
      try {
        dispatch({ type: 'SET_TOKEN', payload: token });
        dispatch({ type: 'SET_USER', payload: JSON.parse(userData) });
        dispatch({ type: 'SET_AUTHENTICATED', payload: true });
        
        // Verify token with backend
        await fetchUserData();
      } catch (error) {
        console.error('Token verification failed:', error);
        logout();
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthContext: Starting login process...');
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('AuthContext: Making API call to login...');
      const response = await axios.post(`${ApiEndpoints.auth}/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      console.log('AuthContext: Login response received:', { token: !!token, user });
      
      localStorage.setItem(LocalStorageKeys.TOKEN, token);
      localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });

      console.log('AuthContext: Login successful, returning true');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.post(`${ApiEndpoints.auth}/register`, userData);
      
      const { token, user } = response.data;
      
      localStorage.setItem(LocalStorageKeys.TOKEN, token);
      localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const googleSignIn = async (googleData: any): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.post(`${ApiEndpoints.auth}/google-signin`, googleData);
      
      const { token, user } = response.data;
      
      localStorage.setItem(LocalStorageKeys.TOKEN, token);
      localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      });

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Google sign-in failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
      return false;
    }
  };

  const fetchUserData = async (): Promise<void> => {
    if (!state.token || !state.user?.userId) return;

    try {
      const response = await axios.get(`${ApiEndpoints.profile}?userId=${state.user.userId}`, {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      const userData = response.data;
      localStorage.setItem(LocalStorageKeys.USER, JSON.stringify(userData));
      dispatch({ type: 'SET_USER', payload: userData });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem(LocalStorageKeys.TOKEN);
    localStorage.removeItem(LocalStorageKeys.USER);
    dispatch({ type: 'LOGOUT' });
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!state.user?.email) return false;

    try {
      await axios.post(`${ApiEndpoints.auth}/change-password`, {
        email: state.user.email,
        currentPassword,
        newPassword,
      }, {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      return true;
    } catch (error) {
      console.error('Error changing password:', error);
      return false;
    }
  };

  const sendVerificationEmail = async (email: string): Promise<boolean> => {
    try {
      await axios.post(`${ApiEndpoints.auth}/send-verification`, { email });
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    googleSignIn,
    logout,
    changePassword,
    sendVerificationEmail,
    fetchUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 