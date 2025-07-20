import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Assignment,
  ArrowBack,
  Search,
  EmojiEvents,
  TrendingUp,
  Star,
  CalendarToday,
  Timer,
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/axiosConfig';

interface QuizResult {
  id: string;
  quizId: string;
  quizTitle: string;
  quizCategory: string;
  quizDifficulty: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  completedAt: string;
  isPassed: boolean;
  percentage: number;
}

const SolvedQuizzesScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();

  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<QuizResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuizResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [quizResults, searchTerm, activeTab]);

  const fetchQuizResults = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/quiz-results');
      setQuizResults(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch quiz results');
    } finally {
      setIsLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = [...quizResults];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.quizCategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    switch (activeTab) {
      case 1: // Passed
        filtered = filtered.filter(result => result.isPassed);
        break;
      case 2: // Failed
        filtered = filtered.filter(result => !result.isPassed);
        break;
      case 3: // Recent
        filtered = filtered.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
        break;
      case 4: // High Scores
        filtered = filtered.sort((a, b) => b.percentage - a.percentage);
        break;
      default: // All
        break;
    }

    setFilteredResults(filtered);
  };

  const handleViewResult = (resultId: string) => {
    navigate(`/quiz-result/${resultId}`);
  };

  const handleRetakeQuiz = (quizId: string) => {
    navigate(`/quiz/${quizId}`);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return currentTheme.success;
    if (percentage >= 70) return currentTheme.warning;
    return currentTheme.error;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return currentTheme.success;
      case 'medium':
        return currentTheme.warning;
      case 'hard':
        return currentTheme.error;
      default:
        return currentTheme.textSecondary;
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getStats = () => {
    const total = quizResults.length;
    const passed = quizResults.filter(r => r.isPassed).length;
    const averageScore = total > 0 ? quizResults.reduce((sum, r) => sum + r.percentage, 0) / total : 0;
    const totalTime = quizResults.reduce((sum, r) => sum + r.timeTaken, 0);

    return { total, passed, averageScore, totalTime };
  };

  const stats = getStats();

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
            <Assignment sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              Quiz History
            </Typography>
          </Box>
          <Button
            startIcon={<Refresh />}
            onClick={fetchQuizResults}
            disabled={isLoading}
            sx={{
              color: currentTheme.primary,
              '&:hover': {
                backgroundColor: currentTheme.primary + '10',
              },
            }}
          >
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
          <Card sx={{ backgroundColor: currentTheme.surface }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: currentTheme.primary, mb: 1 }} />
              <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                Total Quizzes
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ backgroundColor: currentTheme.surface }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: currentTheme.success, mb: 1 }} />
              <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                {stats.passed}
              </Typography>
              <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                Passed
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ backgroundColor: currentTheme.surface }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, color: currentTheme.warning, mb: 1 }} />
              <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                {stats.averageScore.toFixed(1)}%
              </Typography>
              <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                Average Score
              </Typography>
            </CardContent>
          </Card>

          <Card sx={{ backgroundColor: currentTheme.surface }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timer sx={{ fontSize: 40, color: currentTheme.info, mb: 1 }} />
              <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                {formatTime(stats.totalTime)}
              </Typography>
              <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                Total Time
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Tabs */}
        <Paper sx={{ backgroundColor: currentTheme.surface, mb: 4 }}>
          <Box sx={{ p: 3 }}>
            <TextField
              fullWidth
              placeholder="Search quizzes by title or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: currentTheme.textSecondary }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: currentTheme.background,
                },
              }}
            />

            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                borderBottom: 1,
                borderColor: currentTheme.background,
                '& .MuiTab-root': {
                  color: currentTheme.textSecondary,
                  '&.Mui-selected': {
                    color: currentTheme.primary,
                  },
                },
              }}
            >
              <Tab label="All" />
              <Tab label="Passed" />
              <Tab label="Failed" />
              <Tab label="Recent" />
              <Tab label="High Scores" />
            </Tabs>
          </Box>
        </Paper>

        {/* Quiz Results List */}
        <Paper sx={{ backgroundColor: currentTheme.surface }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : filteredResults.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Assignment sx={{ fontSize: 64, color: currentTheme.textSecondary, mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" gutterBottom sx={{ color: currentTheme.textPrimary }}>
                No Quiz Results Found
              </Typography>
              <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 3 }}>
                {searchTerm ? 'Try adjusting your search terms.' : 'Complete some quizzes to see your results here.'}
              </Typography>
              {!searchTerm && (
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
                  Take a Quiz
                </Button>
              )}
            </Box>
          ) : (
            <List>
              {filteredResults.map((result, index) => (
                <React.Fragment key={result.id}>
                  <ListItem sx={{ px: 3, py: 2 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                            {result.quizTitle}
                          </Typography>
                          <Chip
                            label={result.quizCategory}
                            size="small"
                            sx={{
                              backgroundColor: currentTheme.primary + '20',
                              color: currentTheme.primary,
                            }}
                          />
                          <Chip
                            label={result.quizDifficulty}
                            size="small"
                            sx={{
                              backgroundColor: getDifficultyColor(result.quizDifficulty) + '20',
                              color: getDifficultyColor(result.quizDifficulty),
                            }}
                          />
                          <Chip
                            label={result.isPassed ? 'Passed' : 'Failed'}
                            size="small"
                            color={result.isPassed ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmojiEvents sx={{ fontSize: 16, color: getScoreColor(result.percentage) }} />
                              <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                                {result.correctAnswers}/{result.totalQuestions} correct ({result.percentage}%)
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Timer sx={{ fontSize: 16, color: currentTheme.textSecondary }} />
                              <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                                {formatTime(result.timeTaken)}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday sx={{ fontSize: 16, color: currentTheme.textSecondary }} />
                              <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                                {new Date(result.completedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewResult(result.id)}
                          sx={{
                            borderColor: currentTheme.primary,
                            color: currentTheme.primary,
                            '&:hover': {
                              borderColor: currentTheme.primary,
                              backgroundColor: currentTheme.primary + '10',
                            },
                          }}
                        >
                          <Visibility sx={{ fontSize: 16, mr: 0.5 }} />
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleRetakeQuiz(result.quizId)}
                          sx={{
                            backgroundColor: currentTheme.success,
                            '&:hover': {
                              backgroundColor: currentTheme.success,
                              opacity: 0.9,
                            },
                          }}
                        >
                          Retake
                        </Button>
                      </Box>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < filteredResults.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default SolvedQuizzesScreen; 