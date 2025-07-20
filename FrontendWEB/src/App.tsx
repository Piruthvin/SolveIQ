import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { QuizProvider } from './contexts/QuizContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ChatbotProvider } from './contexts/ChatbotContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './contexts/ThemeContext';

// Screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import MainScreen from './screens/MainScreen';
import ClassroomScreen from './screens/ClassroomScreen';
import ClassroomDetailsScreen from './screens/ClassroomDetailsScreen';
import SearchProfileScreen from './screens/SearchProfileScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import CreateQuizScreen from './screens/CreateQuizScreen';
import ManageUsersScreen from './screens/ManageUsersScreen';
import AddUserScreen from './screens/AddUserScreen';
import SolvedQuizzesScreen from './screens/SolvedQuizzesScreen';
import QuizSolveScreen from './screens/QuizSolveScreen';

// Components
import ProtectedRoute from './components/ProtectedRoute';

const AppContent = () => {
  const { currentTheme } = useTheme();

  const theme = createTheme({
    palette: {
      primary: {
        main: currentTheme.primary,
      },
      secondary: {
        main: currentTheme.secondary,
      },
      background: {
        default: currentTheme.background,
        paper: currentTheme.surface,
      },
      text: {
        primary: currentTheme.textPrimary,
        secondary: currentTheme.textSecondary,
      },
    },
    typography: {
      fontFamily: 'Poppins, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signup" element={<SignupScreen />} />
          <Route path="/" element={<ProtectedRoute><MainScreen /></ProtectedRoute>} />
          <Route path="/classroom" element={<ProtectedRoute><ClassroomScreen /></ProtectedRoute>} />
          <Route path="/classroom-details" element={<ProtectedRoute><ClassroomDetailsScreen /></ProtectedRoute>} />
          <Route path="/search-profile" element={<ProtectedRoute><SearchProfileScreen /></ProtectedRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><ChatbotScreen /></ProtectedRoute>} />
          <Route path="/create-quiz" element={<ProtectedRoute><CreateQuizScreen /></ProtectedRoute>} />
          <Route path="/manage-users" element={<ProtectedRoute><ManageUsersScreen /></ProtectedRoute>} />
          <Route path="/add-user" element={<ProtectedRoute><AddUserScreen /></ProtectedRoute>} />
          <Route path="/solved-quizzes" element={<ProtectedRoute><SolvedQuizzesScreen /></ProtectedRoute>} />
          <Route path="/quiz/:quizId" element={<ProtectedRoute><QuizSolveScreen /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <QuizProvider>
          <ProfileProvider>
            <ChatbotProvider>
              <AppContent />
            </ChatbotProvider>
          </ProfileProvider>
        </QuizProvider>
      </AuthProvider>
    </CustomThemeProvider>
  );
};

export default App; 