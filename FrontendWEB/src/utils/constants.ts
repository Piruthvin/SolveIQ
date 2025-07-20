export const AppColors = {
  primary: '#2563EB',
  secondary: '#3B82F6',
  accent: '#10B981',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  textPrimary: '#1E293B',
  textSecondary: '#64748B',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const ApiEndpoints = {
  baseUrl: 'http://localhost:8800/api',
  auth: 'http://localhost:8800/api/auth',
  analytics: 'http://localhost:8800/api/admin/analytics',
  users: 'http://localhost:8800/api/admin/users',
  quiz: 'http://localhost:8800/api/quiz',
  profile: 'http://localhost:8800/api/profile',
  leaderboard: 'http://localhost:8800/api/leaderboard',
  classroom: 'http://localhost:8800/api/classroom',
  admin: 'http://localhost:8800/api/admin',
  chatbot: 'http://localhost:8800/api/chatbot',
};

export const AppConstants = {
  appName: 'SolveIQ',
  appVersion: '1.0.0',
  maxStreakDays: 365,
  dailyQuizTarget: 5,
};

export const QuizCategories = [
  'Algorithms',
  'Data Structures',
  'Database',
  'System Design',
  'Frontend',
  'Backend',
  'DevOps',
  'Mobile',
];

export const QuizDifficulties = [
  'Easy',
  'Medium',
  'Hard',
];

export const UserRoles = {
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  ADMIN: 'ADMIN',
};

export const BadgeTypes = {
  STREAK: 'STREAK',
  QUIZ_COUNT: 'QUIZ_COUNT',
  PERFECT_SCORE: 'PERFECT_SCORE',
  CATEGORY_MASTER: 'CATEGORY_MASTER',
  DAILY_GOAL: 'DAILY_GOAL',
};

export const LocalStorageKeys = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};

// UI Constants
export const UIUtils = {
  padding: {
    small: 8,
    medium: 16,
    large: 24,
    xlarge: 32,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
}; 