import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  AppBar,
  Toolbar,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Button,
} from '@mui/material';
import {
  Leaderboard,
  ArrowBack,
  EmojiEvents,
  Person,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ApiEndpoints } from '../utils/constants';

interface LeaderboardEntry {
  userId: string;
  userName?: string;
  name?: string;
  college?: string;
  score: number;
  rank?: number;
}

interface UserStats {
  rank: number;
  score: number;
}

interface LeaderboardData {
  top100: LeaderboardEntry[];
  userStats?: UserStats;
}

const LeaderboardScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();
  
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [collegeLeaderboard, setCollegeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    console.log('LeaderboardScreen: Starting to load leaderboard...');
    console.log('LeaderboardScreen: User ID:', user?.userId);
    console.log('LeaderboardScreen: College:', user?.college);
    console.log('LeaderboardScreen: Token:', token ? 'Present' : 'Missing');
    
    setIsLoading(true);
    setError(null);

    try {
      // Global leaderboard
      const globalRes = await axios.get(
        `${ApiEndpoints.leaderboard}/daily?userId=${user?.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // College leaderboard
      const collegeRes = await axios.get(
        `${ApiEndpoints.leaderboard}/college?college=${user?.college || 'all'}&userId=${user?.userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('LeaderboardScreen: Global response:', globalRes.data);
      console.log('LeaderboardScreen: College response:', collegeRes.data);

      if (globalRes.status === 200 && collegeRes.status === 200) {
        const globalData: LeaderboardData = globalRes.data;
        const collegeData: LeaderboardData = collegeRes.data;
        
        setGlobalLeaderboard(
          (globalData.top100 || []).filter((user) => user.userId != null)
        );
        setCollegeLeaderboard(
          (collegeData.top100 || []).filter((user) => user.userId != null)
        );
        setUserStats(globalData.userStats || null);
      } else {
        setGlobalLeaderboard([]);
        setCollegeLeaderboard([]);
        setUserStats(null);
      }
    } catch (error: any) {
      console.error('LeaderboardScreen: Error loading leaderboard:', error);
      console.error('LeaderboardScreen: Error response:', error.response);
      
      setGlobalLeaderboard([]);
      setCollegeLeaderboard([]);
      setUserStats(null);
      
      if (error.response?.status === 403) {
        setError('Authentication required. Please login again.');
      } else {
        setError('Failed to load leaderboard data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLeaderboard = () => {
    return activeTab === 0 ? globalLeaderboard : collegeLeaderboard;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return currentTheme.textSecondary;
  };

  const viewUserProfile = (userId: string) => {
    navigate('/search-profile', { state: { userId } });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
            onClick={() => navigate('/')}
            sx={{ color: currentTheme.textPrimary, mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Leaderboard sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              Leaderboard
            </Typography>
          </Box>
          <IconButton
            onClick={loadLeaderboard}
            sx={{ color: currentTheme.textPrimary }}
          >
            <Refresh />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Tab Bar */}
        <Card sx={{ mb: 3, backgroundColor: currentTheme.surface }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                color: currentTheme.textSecondary,
                '&.Mui-selected': {
                  color: currentTheme.primary,
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: currentTheme.primary,
              },
            }}
          >
            <Tab label="Global" />
            <Tab label="College" />
          </Tabs>
        </Card>

        {/* User Stats Card */}
        {userStats && (
          <Card
            sx={{
              mb: 3,
              background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                  sx={{
                    width: 50,
                    height: 50,
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    mr: 2,
                  }}
                >
                  <Person />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Your Rank
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    #{userStats.rank}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Questions Solved
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {userStats.score}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard List */}
        <Card sx={{ backgroundColor: currentTheme.surface }}>
          {getCurrentLeaderboard().length === 0 ? (
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
                No leaderboard data available
              </Typography>
              <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 3 }}>
                {activeTab === 0 
                  ? 'Global leaderboard data is not available at the moment.'
                  : 'College leaderboard data is not available at the moment.'
                }
              </Typography>
              <Button
                variant="contained"
                onClick={loadLeaderboard}
                startIcon={<Refresh />}
              >
                Refresh
              </Button>
            </CardContent>
          ) : (
            <List sx={{ p: 0 }}>
              {getCurrentLeaderboard().map((entry, index) => {
                const rank = index + 1;
                const name = entry.userName || entry.name || 'User';
                const college = entry.college;
                const score = entry.score;
                const userId = entry.userId;

                return (
                                     <ListItem
                     key={userId}
                     component="div"
                     onClick={() => viewUserProfile(userId)}
                    sx={{
                      borderBottom: `1px solid ${currentTheme.textSecondary}10`,
                      '&:last-child': {
                        borderBottom: 'none',
                      },
                      '&:hover': {
                        backgroundColor: currentTheme.background,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: getRankColor(rank) + '20',
                          color: getRankColor(rank),
                          fontWeight: 'bold',
                        }}
                      >
                        #{rank}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body1" sx={{ fontWeight: 600, color: currentTheme.textPrimary }}>
                          {name}
                        </Typography>
                      }
                      secondary={
                        college && (
                          <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                            {college}
                          </Typography>
                        )
                      }
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                        Questions Solved
                      </Typography>
                      <Typography variant="h6" sx={{ color: currentTheme.primary, fontWeight: 700 }}>
                        {score}
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Card>

        {/* Top 3 Podium */}
        {getCurrentLeaderboard().length > 0 && (
          <Card sx={{ mt: 3, backgroundColor: currentTheme.surface }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ color: currentTheme.textPrimary, mb: 3, textAlign: 'center' }}>
                Top Performers
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'end', gap: 2 }}>
                {/* 2nd Place */}
                {getCurrentLeaderboard()[1] && (
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: '#C0C0C0',
                        mx: 'auto',
                        mb: 1,
                      }}
                    >
                      <EmojiEvents />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#C0C0C0', fontWeight: 700 }}>
                      #{2}
                    </Typography>
                    <Typography variant="body2" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                      {getCurrentLeaderboard()[1].userName || getCurrentLeaderboard()[1].name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                      {getCurrentLeaderboard()[1].score} solved
                    </Typography>
                  </Box>
                )}

                {/* 1st Place */}
                {getCurrentLeaderboard()[0] && (
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: '#FFD700',
                        mx: 'auto',
                        mb: 1,
                      }}
                    >
                      <EmojiEvents />
                    </Avatar>
                    <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 700 }}>
                      #{1}
                    </Typography>
                    <Typography variant="body1" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                      {getCurrentLeaderboard()[0].userName || getCurrentLeaderboard()[0].name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                      {getCurrentLeaderboard()[0].score} solved
                    </Typography>
                  </Box>
                )}

                {/* 3rd Place */}
                {getCurrentLeaderboard()[2] && (
                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                    <Avatar
                      sx={{
                        width: 60,
                        height: 60,
                        backgroundColor: '#CD7F32',
                        mx: 'auto',
                        mb: 1,
                      }}
                    >
                      <EmojiEvents />
                    </Avatar>
                    <Typography variant="h6" sx={{ color: '#CD7F32', fontWeight: 700 }}>
                      #{3}
                    </Typography>
                    <Typography variant="body2" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                      {getCurrentLeaderboard()[2].userName || getCurrentLeaderboard()[2].name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                      {getCurrentLeaderboard()[2].score} solved
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default LeaderboardScreen; 