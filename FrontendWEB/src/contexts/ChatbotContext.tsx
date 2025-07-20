import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { ApiEndpoints } from '../utils/constants';
import { useAuth } from './AuthContext';

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type: 'text' | 'explanation' | 'hint';
  quizId?: string;
  questionId?: string;
}

interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
}

interface ChatbotContextType {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  isTyping: boolean;
  sendMessage: (content: string, type?: 'text' | 'explanation' | 'hint', quizId?: string, questionId?: string) => Promise<void>;
  getExplanation: (quizId: string, questionId: string) => Promise<void>;
  getHint: (quizId: string, questionId: string) => Promise<void>;
  clearChat: () => void;
  loadChatHistory: () => Promise<void>;
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

const initialState: ChatbotState = {
  messages: [],
  isLoading: false,
  error: null,
  isTyping: false,
};

type ChatbotAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'CLEAR_MESSAGES' };

const chatbotReducer = (state: ChatbotState, action: ChatbotAction): ChatbotState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TYPING':
      return { ...state, isTyping: action.payload };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_MESSAGES':
      return { ...state, messages: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    default:
      return state;
  }
};

export const ChatbotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(chatbotReducer, initialState);
  const { token, user } = useAuth();

  const sendMessage = async (
    content: string, 
    type: 'text' | 'explanation' | 'hint' = 'text',
    quizId?: string,
    questionId?: string
  ) => {
    if (!user?.userId) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type,
      quizId,
      questionId,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    dispatch({ type: 'SET_TYPING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.post(`${ApiEndpoints.chatbot}/chat`, {
        message: content,
        userId: user.userId,
        type,
        quizId,
        questionId,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Add bot response
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'text',
        quizId,
        questionId,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: botMessage });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Add error message from bot
      const errorBotMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'text',
        quizId,
        questionId,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: errorBotMessage });
    } finally {
      dispatch({ type: 'SET_TYPING', payload: false });
    }
  };

  const getExplanation = async (quizId: string, questionId: string) => {
    if (!user?.userId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.get(`${ApiEndpoints.chatbot}/explanation`, {
        params: {
          quizId,
          questionId,
          userId: user.userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const explanationMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.data.explanation,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'explanation',
        quizId,
        questionId,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: explanationMessage });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get explanation';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getHint = async (quizId: string, questionId: string) => {
    if (!user?.userId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.get(`${ApiEndpoints.chatbot}/hint`, {
        params: {
          quizId,
          questionId,
          userId: user.userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const hintMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response.data.hint,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        type: 'hint',
        quizId,
        questionId,
      };

      dispatch({ type: 'ADD_MESSAGE', payload: hintMessage });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to get hint';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearChat = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const loadChatHistory = async () => {
    if (!user?.userId) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.get(`${ApiEndpoints.chatbot}/history`, {
        params: {
          userId: user.userId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      dispatch({ type: 'SET_MESSAGES', payload: response.data });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load chat history';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const value: ChatbotContextType = {
    ...state,
    sendMessage,
    getExplanation,
    getHint,
    clearChat,
    loadChatHistory,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider');
  }
  return context;
}; 