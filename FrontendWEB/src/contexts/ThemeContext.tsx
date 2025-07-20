import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppColors, LocalStorageKeys } from '../utils/constants';

interface Theme {
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

interface ThemeState {
  currentTheme: Theme;
  isDarkMode: boolean;
}

interface ThemeContextType {
  currentTheme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
  setCustomTheme: (customTheme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightTheme: Theme = {
  mode: 'light',
  primary: AppColors.primary,
  secondary: AppColors.secondary,
  accent: AppColors.accent,
  background: AppColors.background,
  surface: AppColors.surface,
  textPrimary: AppColors.textPrimary,
  textSecondary: AppColors.textSecondary,
  error: AppColors.error,
  success: AppColors.success,
  warning: AppColors.warning,
  info: AppColors.info,
};

const darkTheme: Theme = {
  mode: 'dark',
  primary: '#3B82F6',
  secondary: '#60A5FA',
  accent: '#34D399',
  background: '#1F2937',
  surface: '#374151',
  textPrimary: '#F9FAFB',
  textSecondary: '#D1D5DB',
  error: '#F87171',
  success: '#34D399',
  warning: '#FBBF24',
  info: '#60A5FA',
};

const initialState: ThemeState = {
  currentTheme: lightTheme,
  isDarkMode: false,
};

type ThemeAction = 
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'SET_DARK_MODE'; payload: boolean };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'TOGGLE_THEME':
      const newMode = state.isDarkMode ? 'light' : 'dark';
      const newTheme = newMode === 'dark' ? darkTheme : lightTheme;
      return {
        ...state,
        currentTheme: newTheme,
        isDarkMode: !state.isDarkMode,
      };
    case 'SET_THEME':
      return {
        ...state,
        currentTheme: action.payload,
        isDarkMode: action.payload.mode === 'dark',
      };
    case 'SET_DARK_MODE':
      return {
        ...state,
        currentTheme: action.payload ? darkTheme : lightTheme,
        isDarkMode: action.payload,
      };
    default:
      return state;
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState);

  useEffect(() => {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem(LocalStorageKeys.THEME);
    if (savedTheme) {
      try {
        const themeData = JSON.parse(savedTheme);
        dispatch({ type: 'SET_THEME', payload: themeData });
      } catch (error) {
        console.error('Error parsing saved theme:', error);
        // Fallback to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        dispatch({ type: 'SET_DARK_MODE', payload: prefersDark });
      }
    } else {
      // Use system preference if no saved theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch({ type: 'SET_DARK_MODE', payload: prefersDark });
    }
  }, []);

  useEffect(() => {
    // Save theme preference to localStorage
    localStorage.setItem(LocalStorageKeys.THEME, JSON.stringify(state.currentTheme));
  }, [state.currentTheme]);

  const toggleTheme = () => {
    dispatch({ type: 'TOGGLE_THEME' });
  };

  const setDarkMode = (isDark: boolean) => {
    dispatch({ type: 'SET_DARK_MODE', payload: isDark });
  };

  const setCustomTheme = (customTheme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: customTheme });
  };

  const value: ThemeContextType = {
    currentTheme: state.currentTheme,
    isDarkMode: state.isDarkMode,
    toggleTheme,
    setDarkMode,
    setCustomTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 