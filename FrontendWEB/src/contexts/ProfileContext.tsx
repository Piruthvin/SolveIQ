import React, { createContext, useContext, useReducer } from 'react';
import axios from 'axios';
import { ApiEndpoints } from '../utils/constants';
import { useAuth } from './AuthContext';

interface UserProfile {
  userId: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  mobileNumber?: string;
  bio?: string;
  profilePicture?: string;
  currentStreak?: number;
  streak?: number;
  totalScore?: number;
  quizzesCompleted?: number;
  totalQuizzesSolved?: number;
  averageScore?: number;
  totalQuestionsAnswered?: number;
  daysActive?: number;
  rank?: string;
  links?: string[];
  badges?: any[];
}

interface ProfileState {
  profile: UserProfile | null;
  searchResults: UserProfile[];
  isLoading: boolean;
  error: string | null;
}

interface ProfileContextType {
  profile: UserProfile | null;
  searchResults: UserProfile[];
  isLoading: boolean;
  error: string | null;
  fetchProfile: () => Promise<void>;
  searchStudents: (query: string) => Promise<void>;
  getPublicProfile: (userId: string) => Promise<UserProfile | null>;
  fetchAllProfiles: () => Promise<UserProfile[]>;
  uploadProfilePicture: (file: File) => Promise<boolean>;
  clearSearchResults: () => void;
  getStreakEmoji: (streak: number) => string;
  getRankColor: (rank: string) => string;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const initialState: ProfileState = {
  profile: null,
  searchResults: [],
  isLoading: false,
  error: null,
};

type ProfileAction = 
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PROFILE'; payload: UserProfile | null }
  | { type: 'SET_SEARCH_RESULTS'; payload: UserProfile[] }
  | { type: 'CLEAR_SEARCH_RESULTS' };

const profileReducer = (state: ProfileState, action: ProfileAction): ProfileState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PROFILE':
      return { ...state, profile: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload };
    case 'CLEAR_SEARCH_RESULTS':
      return { ...state, searchResults: [] };
    default:
      return state;
  }
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(profileReducer, initialState);
  const { token, user } = useAuth();

  const fetchProfile = async () => {
    console.log('ProfileContext: Starting to fetch profile...');
    console.log('ProfileContext: User ID:', user?.userId);
    console.log('ProfileContext: Token:', token ? 'Present' : 'Missing');
    console.log('ProfileContext: API endpoint:', `${ApiEndpoints.profile}?userId=${user?.userId}`);
    
    if (!user?.userId || !token) {
      console.log('ProfileContext: Missing user ID or token, returning early');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      console.log('ProfileContext: Making API call...');
      const response = await axios.get(`${ApiEndpoints.profile}?userId=${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('ProfileContext: API response received:', response.data);

      if (response.status === 200) {
        const profileData = response.data;
        console.log('ProfileContext: Profile data before processing:', profileData);
        
        // Map backend response to frontend format
        const mappedProfileData: UserProfile = {
          userId: profileData.userId?.toString() || '',
          name: profileData.name || '',
          email: profileData.email || '',
          role: profileData.role || '',
          college: profileData.college || '',
          mobileNumber: profileData.mobileNumber || '',
          bio: profileData.bio || '',
          profilePicture: profileData.profilePicture || '',
          currentStreak: profileData.currentStreak || 0,
          streak: profileData.currentStreak || 0, // Map currentStreak to streak
          totalScore: profileData.averageScore ? Math.round(profileData.averageScore) : 0, // Map averageScore to totalScore
          quizzesCompleted: profileData.totalQuizzesSolved || 0, // Map totalQuizzesSolved to quizzesCompleted
          totalQuizzesSolved: profileData.totalQuizzesSolved || 0,
          averageScore: profileData.averageScore || 0,
          totalQuestionsAnswered: profileData.totalQuestionsAnswered || 0,
          daysActive: profileData.daysActive || 0,
          rank: profileData.rank || 'N/A',
          links: Array.isArray(profileData.links) ? profileData.links : [],
          badges: profileData.badges || []
        };
        
        console.log('ProfileContext: Mapped profile data:', mappedProfileData);
        dispatch({ type: 'SET_PROFILE', payload: mappedProfileData });
      }
    } catch (error: any) {
      console.error('ProfileContext: Error fetching profile:', error);
      console.error('ProfileContext: Error response:', error.response);
      const errorMessage = error.response?.data?.message || 'Failed to fetch profile';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const searchStudents = async (query: string) => {
    if (!token) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await axios.get(`${ApiEndpoints.profile}/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        dispatch({ type: 'SET_SEARCH_RESULTS', payload: response.data });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to search students';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getPublicProfile = async (userId: string): Promise<UserProfile | null> => {
    if (!token) return null;

    try {
      const response = await axios.get(`${ApiEndpoints.profile}/public/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        return response.data;
      }
    } catch (error: any) {
      console.error('Failed to fetch public profile:', error);
    }
    return null;
  };

  const fetchAllProfiles = async (): Promise<UserProfile[]> => {
    if (!token) return [];

    try {
      const response = await axios.get(`${ApiEndpoints.profile}/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        return response.data;
      }
    } catch (error: any) {
      console.error('Failed to fetch all profiles:', error);
    }
    return [];
  };

  const uploadProfilePicture = async (file: File): Promise<boolean> => {
    if (!user?.userId || !token) return false;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.patch(
        `${ApiEndpoints.profile}/profile-picture?userId=${user.userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 200) {
        const profileData = response.data;
        if (profileData.links && !Array.isArray(profileData.links)) {
          profileData.links = [];
        }
        dispatch({ type: 'SET_PROFILE', payload: profileData });
        return true;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to upload profile picture';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
    return false;
  };

  const clearSearchResults = () => {
    dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
  };

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 100) return '🔥🔥🔥';
    if (streak >= 50) return '🔥🔥';
    if (streak >= 10) return '🔥';
    if (streak >= 5) return '⚡';
    return '📚';
  };

  const getRankColor = (rank: string): string => {
    if (rank.includes('Top 10')) return '#FFD700'; // Gold
    if (rank.includes('Top 50')) return '#C0C0C0'; // Silver
    if (rank.includes('Top 100')) return '#CD7F32'; // Bronze
    return '#686868'; // Gray
  };

  const value: ProfileContextType = {
    profile: state.profile,
    searchResults: state.searchResults,
    isLoading: state.isLoading,
    error: state.error,
    fetchProfile,
    searchStudents,
    getPublicProfile,
    fetchAllProfiles,
    uploadProfilePicture,
    clearSearchResults,
    getStreakEmoji,
    getRankColor,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}; 