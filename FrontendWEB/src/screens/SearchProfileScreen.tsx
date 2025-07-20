import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Card,
  CardContent,
  Avatar,
  Chip,
  IconButton,
  InputAdornment,
  CircularProgress,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Search,
  Clear,
  ArrowBack,
  Person,
  Email,
  School,
  Work,
  TrendingUp,
  EmojiEvents,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ApiEndpoints } from '../utils/constants';
import axios from 'axios';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  college: string;
  role: string;
  score: number;
  rank: string;
  currentStreak?: number;
  totalQuizzes?: number;
  solvedQuizzes?: number;
}

const SearchProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { token } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    loadAllProfiles();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() === '') {
        setSearchResults(allProfiles);
      } else if (searchQuery.length >= 3) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, allProfiles]);

  const loadAllProfiles = async () => {
    setIsSearching(true);
    try {
      console.log('SearchProfileScreen: Loading all profiles...');
      const response = await axios.get(`${ApiEndpoints.profile}/all`);
      console.log('SearchProfileScreen: All profiles response:', response.data);
      
      const profiles = response.data.map((profile: any) => ({
        id: profile.id || profile.userId,
        name: profile.name || 'Unknown',
        email: profile.email || '',
        college: profile.college || '',
        role: profile.role || 'STUDENT',
        score: profile.score || 0,
        rank: profile.rank || 'N/A',
        currentStreak: profile.currentStreak || 0,
        totalQuizzes: profile.totalQuizzes || 0,
        solvedQuizzes: profile.solvedQuizzes || 0,
      }));
      
      setAllProfiles(profiles);
      setSearchResults(profiles);
    } catch (error) {
      console.error('SearchProfileScreen: Error loading profiles:', error);
      setAllProfiles([]);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const performSearch = async (query: string) => {
    if (!token) return;
    
    setIsSearching(true);
    try {
      console.log('SearchProfileScreen: Searching for:', query);
      const response = await axios.get(`${ApiEndpoints.profile}/search?query=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('SearchProfileScreen: Search response:', response.data);
      
      const profiles = response.data.map((profile: any) => ({
        id: profile.id || profile.userId,
        name: profile.name || 'Unknown',
        email: profile.email || '',
        college: profile.college || '',
        role: profile.role || 'STUDENT',
        score: profile.score || 0,
        rank: profile.rank || 'N/A',
        currentStreak: profile.currentStreak || 0,
        totalQuizzes: profile.totalQuizzes || 0,
        solvedQuizzes: profile.solvedQuizzes || 0,
      }));
      
      setSearchResults(profiles);
    } catch (error) {
      console.error('SearchProfileScreen: Error searching:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const getDisplayInitial = (name: string) => {
    return name && name.length > 0 ? name[0].toUpperCase() : '?';
  };

  const getRoleColor = (role: string) => {
    return role === 'ADMIN' ? 'error' : role === 'TEACHER' ? 'warning' : 'primary';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'TEACHER': return 'Teacher';
      case 'STUDENT': return 'Student';
      default: return role;
    }
  };

  return (
    <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh' }}>
      <AppBar
        position="static"
        sx={{
          backgroundColor: currentTheme.surface,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ color: currentTheme.textPrimary, mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              color: currentTheme.textPrimary,
              fontWeight: 700,
            }}
          >
            Search Students
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2 }}>
        {/* Search Bar */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or college..."
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: currentTheme.textSecondary }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setSearchQuery('')}
                    edge="end"
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: currentTheme.surface,
                '& fieldset': {
                  borderColor: currentTheme.textSecondary + '30',
                },
                '&:hover fieldset': {
                  borderColor: currentTheme.primary + '50',
                },
                '&.Mui-focused fieldset': {
                  borderColor: currentTheme.primary,
                },
              },
              '& .MuiInputBase-input': {
                color: currentTheme.textPrimary,
              },
              '& .MuiInputLabel-root': {
                color: currentTheme.textSecondary,
              },
            }}
          />
        </Box>

        {/* Results */}
        <Box>
          {isSearching ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: currentTheme.primary }} />
            </Box>
          ) : searchResults.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography
                variant="h6"
                sx={{ color: currentTheme.textSecondary, mb: 1 }}
              >
                No results found
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: currentTheme.textSecondary }}
              >
                Try a different search term
              </Typography>
            </Box>
          ) : (
            <List>
              {searchResults.map((user) => (
                <Card
                  key={user.id}
                  sx={{
                    mb: 2,
                    backgroundColor: currentTheme.surface,
                    border: `1px solid ${currentTheme.textSecondary}10`,
                  }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <ListItem sx={{ p: 2 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            width: 50,
                            height: 50,
                            backgroundColor: currentTheme.primary + '10',
                            color: currentTheme.primary,
                            fontSize: 20,
                            fontWeight: 'bold',
                          }}
                        >
                          {getDisplayInitial(user.name)}
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Typography
                            variant="h6"
                            sx={{
                              color: currentTheme.textPrimary,
                              fontWeight: 600,
                            }}
                          >
                            {user.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            {user.email && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <Email sx={{ fontSize: 16, color: currentTheme.textSecondary, mr: 1 }} />
                                <Typography
                                  variant="body2"
                                  sx={{ color: currentTheme.textSecondary }}
                                >
                                  {user.email}
                                </Typography>
                              </Box>
                            )}
                            
                            {user.college && (
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                <School sx={{ fontSize: 16, color: currentTheme.textSecondary, mr: 1 }} />
                                <Typography
                                  variant="body2"
                                  sx={{ color: currentTheme.textSecondary }}
                                >
                                  {user.college}
                                </Typography>
                              </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              <Chip
                                label={getRoleLabel(user.role)}
                                color={getRoleColor(user.role) as any}
                                size="small"
                                sx={{ fontSize: 10, fontWeight: 600 }}
                              />
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TrendingUp sx={{ fontSize: 14, color: currentTheme.textSecondary }} />
                                <Typography
                                  variant="caption"
                                  sx={{ color: currentTheme.textSecondary }}
                                >
                                  Score: {user.score}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EmojiEvents sx={{ fontSize: 14, color: currentTheme.textSecondary }} />
                                <Typography
                                  variant="caption"
                                  sx={{ color: currentTheme.textSecondary }}
                                >
                                  Rank: {user.rank}
                                </Typography>
                              </Box>
                            </Box>
                            
                            {user.currentStreak !== undefined && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <Typography
                                  variant="caption"
                                  sx={{ color: currentTheme.success }}
                                >
                                  🔥 {user.currentStreak} day streak
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => {/* View detailed profile */}}
                          sx={{ color: currentTheme.textSecondary }}
                        >
                          <Person />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default SearchProfileScreen; 