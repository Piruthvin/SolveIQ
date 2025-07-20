import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  AdminPanelSettings,
  ArrowBack,
  People,
  Quiz,
  TrendingUp,
  School,
  EmojiEvents,
  Star,
  CalendarToday,
  BarChart,
  Settings,
  PersonAdd,
  Create,
  Analytics,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ApiEndpoints } from '../utils/constants';

interface AdminStats {
  totalUsers: number;
  totalQuizzes: number;
  totalClassrooms: number;
  totalSubmissions: number;
  activeUsers: number;
  newUsersThisWeek: number;
  averageScore: number;
  topPerformer: {
    name: string;
    score: number;
  };
}

// Backend response interface
interface BackendAnalytics {
  totalUsers: number;
  totalQuizzes: number;
  totalColleges: number;
  dailyActive: number;
}

interface RecentActivity {
  id: string;
  type: 'USER_REGISTERED' | 'QUIZ_CREATED' | 'QUIZ_COMPLETED' | 'CLASSROOM_CREATED';
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
}

const AdminScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    console.log('AdminScreen: Starting to fetch admin data...');
    console.log('AdminScreen: User role:', user?.role);
    console.log('AdminScreen: Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      setError('No authentication token found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('AdminScreen: Making API call to analytics endpoint...');
      const statsRes = await axios.get(`${ApiEndpoints.admin}/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('AdminScreen: Analytics response received:', statsRes.data);
      
      // Map backend response to frontend format
      const mappedStats: AdminStats = {
        totalUsers: statsRes.data.totalUsers || 0,
        totalQuizzes: statsRes.data.totalQuizzes || 0,
        totalClassrooms: statsRes.data.totalColleges || 0, // Map colleges to classrooms
        totalSubmissions: 0, // Not available in backend
        activeUsers: statsRes.data.dailyActive || 0,
        newUsersThisWeek: 0, // Not available in backend
        averageScore: 0, // Not available in backend
        topPerformer: {
          name: 'N/A',
          score: 0
        }
      };

      setStats(mappedStats);
      
      // Create mock recent activity since endpoint doesn't exist
      const mockRecentActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'USER_REGISTERED',
          description: 'New user registered',
          timestamp: new Date().toISOString(),
          userId: '1',
          userName: 'New User'
        },
        {
          id: '2',
          type: 'QUIZ_CREATED',
          description: 'New quiz created',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          userId: '1',
          userName: 'Admin'
        }
      ];
      
      setRecentActivity(mockRecentActivity);
      console.log('AdminScreen: Admin data set successfully');
      
    } catch (error: any) {
      console.error('AdminScreen: Error fetching admin data:', error);
      console.error('AdminScreen: Error response:', error.response);
      
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch admin data');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'USER_REGISTERED':
        return <PersonAdd sx={{ color: currentTheme.success }} />;
      case 'QUIZ_CREATED':
        return <Create sx={{ color: currentTheme.primary }} />;
      case 'QUIZ_COMPLETED':
        return <EmojiEvents sx={{ color: currentTheme.warning }} />;
      case 'CLASSROOM_CREATED':
        return <School sx={{ color: currentTheme.info }} />;
      default:
        return <BarChart sx={{ color: currentTheme.textSecondary }} />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'USER_REGISTERED':
        return currentTheme.success;
      case 'QUIZ_CREATED':
        return currentTheme.primary;
      case 'QUIZ_COMPLETED':
        return currentTheme.warning;
      case 'CLASSROOM_CREATED':
        return currentTheme.info;
      default:
        return currentTheme.textSecondary;
    }
  };

  // Debug: Log user role
  console.log('AdminScreen: Current user role:', user?.role);
  
  if (!user || user.role !== 'ADMIN') {
    return (
      <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: currentTheme.surface }}>
          <AdminPanelSettings sx={{ fontSize: 64, color: currentTheme.error, mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ color: currentTheme.textPrimary }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ color: currentTheme.textSecondary, mb: 3 }}>
            You need admin privileges to access this page. Current role: {user?.role || 'None'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/')}
            sx={{
              backgroundColor: currentTheme.primary,
              '&:hover': {
                backgroundColor: currentTheme.primary,
                opacity: 0.9,
              },
            }}
          >
            Back to Home
          </Button>
        </Paper>
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
            <AdminPanelSettings sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              Admin Dashboard
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              startIcon={<PersonAdd />}
              onClick={() => navigate('/add-user')}
              sx={{
                color: currentTheme.primary,
                '&:hover': {
                  backgroundColor: currentTheme.primary + '10',
                },
              }}
            >
              Add User
            </Button>
            <Button
              startIcon={<Create />}
              onClick={() => navigate('/create-quiz')}
              sx={{
                color: currentTheme.primary,
                '&:hover': {
                  backgroundColor: currentTheme.primary + '10',
                },
              }}
            >
              Create Quiz
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Statistics Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
              <Card sx={{ backgroundColor: currentTheme.surface }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 40, color: currentTheme.primary, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                    {stats?.totalUsers.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                    Total Users
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ backgroundColor: currentTheme.surface }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Quiz sx={{ fontSize: 40, color: currentTheme.success, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                    {stats?.totalQuizzes.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                    Total Quizzes
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ backgroundColor: currentTheme.surface }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <School sx={{ fontSize: 40, color: currentTheme.info, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                    {stats?.totalClassrooms.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                    Classrooms
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ backgroundColor: currentTheme.surface }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: currentTheme.warning, mb: 1 }} />
                  <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                    {stats?.totalSubmissions.toLocaleString() || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                    Quiz Submissions
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 4 }}>
              {/* Recent Activity */}
              <Paper sx={{ backgroundColor: currentTheme.surface }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: currentTheme.textPrimary,
                      fontWeight: 600,
                      mb: 3,
                    }}
                  >
                    Recent Activity
                  </Typography>

                  <List>
                    {recentActivity.map((activity) => (
                      <ListItem key={activity.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {getActivityIcon(activity.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={activity.description}
                          secondary={new Date(activity.timestamp).toLocaleString()}
                          sx={{
                            '& .MuiListItemText-primary': {
                              color: currentTheme.textPrimary,
                              fontWeight: 500,
                            },
                            '& .MuiListItemText-secondary': {
                              color: currentTheme.textSecondary,
                            },
                          }}
                        />
                        <Chip
                          label={activity.type.replace('_', ' ')}
                          size="small"
                          sx={{
                            backgroundColor: getActivityColor(activity.type) + '20',
                            color: getActivityColor(activity.type),
                            fontSize: '0.7rem',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Paper>

              {/* Quick Stats */}
              <Paper sx={{ backgroundColor: currentTheme.surface }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: currentTheme.textPrimary,
                      fontWeight: 600,
                      mb: 3,
                    }}
                  >
                    Quick Stats
                  </Typography>

                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Star sx={{ color: currentTheme.success }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={stats?.activeUsers || 0}
                        secondary="Active Users"
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: currentTheme.textPrimary,
                            fontWeight: 600,
                          },
                          '& .MuiListItemText-secondary': {
                            color: currentTheme.textSecondary,
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <CalendarToday sx={{ color: currentTheme.primary }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={stats?.newUsersThisWeek || 0}
                        secondary="New Users This Week"
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: currentTheme.textPrimary,
                            fontWeight: 600,
                          },
                          '& .MuiListItemText-secondary': {
                            color: currentTheme.textSecondary,
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <BarChart sx={{ color: currentTheme.warning }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${stats?.averageScore?.toFixed(1) || 0}%`}
                        secondary="Average Score"
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: currentTheme.textPrimary,
                            fontWeight: 600,
                          },
                          '& .MuiListItemText-secondary': {
                            color: currentTheme.textSecondary,
                          },
                        }}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <EmojiEvents sx={{ color: currentTheme.info }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={stats?.topPerformer?.name || 'N/A'}
                        secondary={`Top Performer (${stats?.topPerformer?.score || 0} pts)`}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: currentTheme.textPrimary,
                            fontWeight: 600,
                          },
                          '& .MuiListItemText-secondary': {
                            color: currentTheme.textSecondary,
                          },
                        }}
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Paper>
            </Box>

            {/* Admin Actions */}
            <Paper sx={{ backgroundColor: currentTheme.surface, mt: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: currentTheme.textPrimary,
                    fontWeight: 600,
                    mb: 3,
                  }}
                >
                  Quick Actions
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAdd />}
                    onClick={() => navigate('/add-user')}
                    sx={{
                      borderColor: currentTheme.primary,
                      color: currentTheme.primary,
                      '&:hover': {
                        borderColor: currentTheme.primary,
                        backgroundColor: currentTheme.primary + '10',
                      },
                    }}
                  >
                    Add User
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Create />}
                    onClick={() => navigate('/create-quiz')}
                    sx={{
                      borderColor: currentTheme.success,
                      color: currentTheme.success,
                      '&:hover': {
                        borderColor: currentTheme.success,
                        backgroundColor: currentTheme.success + '10',
                      },
                    }}
                  >
                    Create Quiz
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<People />}
                    onClick={() => navigate('/manage-users')}
                    sx={{
                      borderColor: currentTheme.info,
                      color: currentTheme.info,
                      '&:hover': {
                        borderColor: currentTheme.info,
                        backgroundColor: currentTheme.info + '10',
                      },
                    }}
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Analytics />}
                    onClick={() => navigate('/admin/analytics')}
                    sx={{
                      borderColor: currentTheme.warning,
                      color: currentTheme.warning,
                      '&:hover': {
                        borderColor: currentTheme.warning,
                        backgroundColor: currentTheme.warning + '10',
                      },
                    }}
                  >
                    View Analytics
                  </Button>
                </Box>
              </CardContent>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AdminScreen; 