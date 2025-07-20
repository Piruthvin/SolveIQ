import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { ApiEndpoints } from '../utils/constants';
import { useAuth } from './AuthContext';

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  knowledgeLevel: string;
  timeLimit: number;
  questionCount: number;
  questions: Question[];
  topic?: string;
  status?: string;
  questionNumber?: number;
  question?: string;
}

interface Question {
  id: string;
  question: string;
  questionText?: string;
  options: string[];
  correctAnswer: number | string;
  explanation?: string;
}

interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: string;
}

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  quizResults: QuizResult[];
  solvedQuizzes: Quiz[];
  quizList: Quiz[];
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
  selectedDifficulty: string | null;
}

interface QuizContextType {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  quizResults: QuizResult[];
  solvedQuizzes: Quiz[];
  quizList: Quiz[];
  questions: Question[];
  isLoading: boolean;
  error: string | null;
  selectedCategory: string | null;
  selectedDifficulty: string | null;
  fetchQuizzes: () => Promise<void>;
  fetchQuizById: (quizId: string) => Promise<void>;
  fetchQuizList: (params?: { topic?: string; knowledgeLevel?: string }) => Promise<void>;
  fetchSolvedQuizzes: () => Promise<void>;
  fetchRandomUnsolvedQuizzes: (params?: { topic?: string; count?: number }) => Promise<void>;
  submitQuiz: (quizId: string, answers: any) => Promise<QuizResult | null>;
  generateQuiz: (params: { knowledgeLevel: string; difficulty: string; topic: string; numQuestions?: number }) => Promise<void>;
  createQuiz: (quizData: any) => Promise<any>;
  updateQuiz: (quizId: string, quizData: any) => Promise<any>;
  deleteQuiz: (quizId: string) => Promise<void>;
  setSelectedCategory: (category: string | null) => void;
  setSelectedDifficulty: (difficulty: string | null) => void;
  clearCurrentQuiz: () => void;
  clearRandomQuizzes: () => void;
  getQuizStats: () => { total: number; solved: number; available: number };
  getQuizzesByCategory: (category: string) => Quiz[];
  getQuizzesByDifficulty: (difficulty: string) => Quiz[];
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  quizResults: [],
  solvedQuizzes: [],
  quizList: [],
  questions: [],
  isLoading: false,
  error: null,
  selectedCategory: null,
  selectedDifficulty: null,
};

type QuizAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_QUIZZES'; payload: Quiz[] }
  | { type: 'SET_CURRENT_QUIZ'; payload: Quiz | null }
  | { type: 'SET_QUIZ_RESULTS'; payload: QuizResult[] }
  | { type: 'SET_SOLVED_QUIZZES'; payload: Quiz[] }
  | { type: 'SET_QUIZ_LIST'; payload: Quiz[] }
  | { type: 'SET_QUESTIONS'; payload: Question[] }
  | { type: 'SET_SELECTED_CATEGORY'; payload: string | null }
  | { type: 'SET_SELECTED_DIFFICULTY'; payload: string | null }
  | { type: 'ADD_QUIZ_RESULT'; payload: QuizResult }
  | { type: 'CLEAR_CURRENT_QUIZ' }
  | { type: 'CLEAR_RANDOM_QUIZZES' };

const quizReducer = (state: QuizState, action: QuizAction): QuizState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_QUIZZES':
      return { ...state, quizzes: action.payload };
    case 'SET_CURRENT_QUIZ':
      return { ...state, currentQuiz: action.payload };
    case 'SET_QUIZ_RESULTS':
      return { ...state, quizResults: action.payload };
    case 'SET_SOLVED_QUIZZES':
      return { ...state, solvedQuizzes: action.payload };
    case 'SET_QUIZ_LIST':
      return { ...state, quizList: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_SELECTED_DIFFICULTY':
      return { ...state, selectedDifficulty: action.payload };
    case 'ADD_QUIZ_RESULT':
      return { ...state, quizResults: [...state.quizResults, action.payload] };
    case 'CLEAR_CURRENT_QUIZ':
      return { ...state, currentQuiz: null, questions: [] };
    case 'CLEAR_RANDOM_QUIZZES':
      return { ...state, quizzes: [] };
    default:
      return state;
  }
};

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(quizReducer, initialState);
  const { token, user } = useAuth();

  const fetchQuizzes = async () => {
    console.log('QuizContext: Starting to fetch quizzes...');
    console.log('QuizContext: Token:', token ? 'Present' : 'Missing');
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('QuizContext: Making API call to fetch all quizzes...');
      const response = await axios.get(`${ApiEndpoints.quiz}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('QuizContext: Quizzes response received:', response.data);
      dispatch({ type: 'SET_QUIZZES', payload: response.data });
    } catch (error: any) {
      console.error('QuizContext: Error fetching quizzes:', error);
      console.error('QuizContext: Error response:', error.response);
      
      if (error.response?.status === 403) {
        dispatch({ type: 'SET_ERROR', payload: 'Authentication required. Please login again.' });
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to fetch quizzes';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchQuizList = async (params?: { topic?: string; knowledgeLevel?: string }) => {
    console.log('QuizContext: Starting to fetch quiz list...');
    console.log('QuizContext: User ID:', user?.userId);
    console.log('QuizContext: Token:', token ? 'Present' : 'Missing');
    console.log('QuizContext: Params:', params);
    
    if (!user?.userId || !token) {
      console.log('QuizContext: Missing user ID or token, returning early');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      let url = `${ApiEndpoints.quiz}/list?userId=${user.userId}`;
      if (params?.topic) url += `&topic=${params.topic}`;
      if (params?.knowledgeLevel) url += `&knowledgeLevel=${params.knowledgeLevel}`;

      console.log('QuizContext: Making API call to:', url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('QuizContext: Quiz list response received:', response.data);
      console.log('QuizContext: Number of quizzes:', response.data.length);
      
      dispatch({ type: 'SET_QUIZ_LIST', payload: response.data });
    } catch (error: any) {
      console.error('QuizContext: Error fetching quiz list:', error);
      console.error('QuizContext: Error response:', error.response);
      
      if (error.response?.status === 403) {
        dispatch({ type: 'SET_ERROR', payload: 'Authentication required. Please login again.' });
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to fetch quiz list';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchRandomUnsolvedQuizzes = async (params?: { topic?: string; count?: number }) => {
    if (!user?.userId || !token) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      let url = `${ApiEndpoints.quiz}/random-unsolved?userId=${user.userId}&count=${params?.count || 5}`;
      if (params?.topic) url += `&topic=${params.topic}`;

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch({ type: 'SET_QUIZZES', payload: response.data });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch random quizzes';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchQuizById = async (quizId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.get(`${ApiEndpoints.quiz}/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      dispatch({ type: 'SET_CURRENT_QUIZ', payload: response.data });
      if (response.data.questions) {
        dispatch({ type: 'SET_QUESTIONS', payload: response.data.questions });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchSolvedQuizzes = async () => {
    console.log('QuizContext: Starting to fetch solved quizzes...');
    console.log('QuizContext: User ID:', user?.userId);
    console.log('QuizContext: Token:', token ? 'Present' : 'Missing');
    
    if (!user?.userId) {
      console.log('QuizContext: Missing user ID, returning early');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('QuizContext: Making API call to fetch solved quizzes...');
      const response = await axios.get(`${ApiEndpoints.quiz}/solved?userId=${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('QuizContext: Solved quizzes response received:', response.data);
      dispatch({ type: 'SET_SOLVED_QUIZZES', payload: response.data });
    } catch (error: any) {
      console.error('QuizContext: Error fetching solved quizzes:', error);
      console.error('QuizContext: Error response:', error.response);
      
      if (error.response?.status === 403) {
        dispatch({ type: 'SET_ERROR', payload: 'Authentication required. Please login again.' });
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to fetch solved quizzes';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
      }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateQuiz = async (params: { knowledgeLevel: string; difficulty: string; topic: string; numQuestions?: number }) => {
    if (!user?.userId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.post(`${ApiEndpoints.chatbot}/generate-quiz`, {
        knowledgeLevel: params.knowledgeLevel,
        difficulty: params.difficulty,
        topic: params.topic,
        numQuestions: params.numQuestions || 5,
        userId: user.userId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const quizData = {
        id: response.data.quizId,
        title: response.data.title,
        description: response.data.description || '',
        category: response.data.category,
        difficulty: response.data.difficulty,
        knowledgeLevel: response.data.knowledgeLevel,
        timeLimit: response.data.timeLimit || 30,
        questionCount: response.data.questions?.length || 0,
        questions: response.data.questions,
      };

      dispatch({ type: 'SET_CURRENT_QUIZ', payload: quizData });
      dispatch({ type: 'SET_QUESTIONS', payload: response.data.questions });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const submitQuiz = async (quizId: string, answers: any): Promise<QuizResult | null> => {
    if (!user?.userId) return null;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.post(`${ApiEndpoints.quiz}/submit`, {
        userId: user.userId,
        quizId: quizId,
        answers: answers,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = response.data;
      dispatch({ type: 'ADD_QUIZ_RESULT', payload: result });
      dispatch({ type: 'CLEAR_CURRENT_QUIZ' });
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createQuiz = async (quizData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.post(`${ApiEndpoints.quiz}`, quizData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateQuiz = async (quizId: string, quizData: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.put(`${ApiEndpoints.quiz}/${quizId}`, quizData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteQuiz = async (quizId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await axios.delete(`${ApiEndpoints.quiz}/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete quiz';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const setSelectedCategory = (category: string | null) => {
    dispatch({ type: 'SET_SELECTED_CATEGORY', payload: category });
  };

  const setSelectedDifficulty = (difficulty: string | null) => {
    dispatch({ type: 'SET_SELECTED_DIFFICULTY', payload: difficulty });
  };

  const clearCurrentQuiz = () => {
    dispatch({ type: 'CLEAR_CURRENT_QUIZ' });
  };

  const clearRandomQuizzes = () => {
    dispatch({ type: 'CLEAR_RANDOM_QUIZZES' });
  };

  const getQuizStats = () => {
    const totalQuizzes = state.quizzes.length;
    const solvedCount = state.solvedQuizzes.length;
    const availableCount = totalQuizzes - solvedCount;

    return {
      total: totalQuizzes,
      solved: solvedCount,
      available: availableCount,
    };
  };

  const getQuizzesByCategory = (category: string) => {
    return state.quizzes.filter((quiz) => quiz.category === category);
  };

  const getQuizzesByDifficulty = (difficulty: string) => {
    return state.quizzes.filter((quiz) => quiz.difficulty === difficulty);
  };

  const value: QuizContextType = {
    quizzes: state.quizzes,
    currentQuiz: state.currentQuiz,
    quizResults: state.quizResults,
    solvedQuizzes: state.solvedQuizzes,
    quizList: state.quizList,
    questions: state.questions,
    isLoading: state.isLoading,
    error: state.error,
    selectedCategory: state.selectedCategory,
    selectedDifficulty: state.selectedDifficulty,
    fetchQuizzes,
    fetchQuizById,
    fetchQuizList,
    fetchSolvedQuizzes,
    fetchRandomUnsolvedQuizzes,
    submitQuiz,
    generateQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    setSelectedCategory,
    setSelectedDifficulty,
    clearCurrentQuiz,
    clearRandomQuizzes,
    getQuizStats,
    getQuizzesByCategory,
    getQuizzesByDifficulty,
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
}; 