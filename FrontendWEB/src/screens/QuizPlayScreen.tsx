import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Paper,
  LinearProgress,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Quiz,
  Refresh,
  Shuffle,
  PlayArrow,
  School,
  TrendingUp,
  EmojiEvents,
  Psychology,
  ArrowBack,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useQuiz } from '../contexts/QuizContext';
import { useProfile } from '../contexts/ProfileContext';
import { ApiEndpoints } from '../utils/constants';

const QuizPlayScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const { 
    quizzes, 
    quizList, 
    isLoading, 
    error, 
    fetchQuizList, 
    fetchRandomUnsolvedQuizzes, 
    clearRandomQuizzes 
  } = useQuiz();
  const { profile } = useProfile();

  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedKnowledgeLevel, setSelectedKnowledgeLevel] = useState<string>('');
  const [topics, setTopics] = useState<string[]>([]);
  const [showingRandomQuizzes, setShowingRandomQuizzes] = useState(false);

  const knowledgeLevels = ['EASY', 'MEDIUM', 'HARD'];

  useEffect(() => {
    if (user?.userId) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    console.log('QuizPlayScreen: Starting to fetch initial data...');
    if (!user?.userId) {
      console.log('QuizPlayScreen: No user ID, returning early');
      return;
    }

    try {
      console.log('QuizPlayScreen: Fetching topics from stats endpoint...');
      // Fetch topics from stats endpoint
      const response = await fetch(`${ApiEndpoints.baseUrl}/stats/home?userId=${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const stats = await response.json();
        console.log('QuizPlayScreen: Stats response:', stats);
        setTopics(stats.topics || []);
      } else {
        console.error('QuizPlayScreen: Stats response not ok:', response.status);
      }

      console.log('QuizPlayScreen: Fetching quiz list...');
      // Fetch regular quiz list
      await fetchQuizList();
    } catch (error) {
      console.error('QuizPlayScreen: Error fetching initial data:', error);
    }
  };

  const handleFilterChange = async () => {
    if (!user?.userId) return;

    const params: { topic?: string; knowledgeLevel?: string } = {};
    if (selectedTopic) params.topic = selectedTopic;
    if (selectedKnowledgeLevel) params.knowledgeLevel = selectedKnowledgeLevel;

    await fetchQuizList(params);
  };

  const handleGenerateRandomQuizzes = async () => {
    if (!user?.userId) return;

    setShowingRandomQuizzes(true);
    await fetchRandomUnsolvedQuizzes({ count: 5 });
  };

  const handleBackToAllQuizzes = () => {
    setShowingRandomQuizzes(false);
    clearRandomQuizzes();
    fetchInitialData();
  };

  const handleStartQuiz = (quiz: any) => {
    navigate(`/quiz/${quiz.id}`);
  };

  const getQuizzesToShow = () => {
    const quizzesToShow = showingRandomQuizzes ? quizzes : quizList;
    console.log('QuizPlayScreen: Quizzes to show:', quizzesToShow);
    console.log('QuizPlayScreen: Showing random quizzes:', showingRandomQuizzes);
    console.log('QuizPlayScreen: Quiz list length:', quizList.length);
    console.log('QuizPlayScreen: Random quizzes length:', quizzes.length);
    return quizzesToShow;
  };

  const getQuizStatusColor = (quiz: any) => {
    if (showingRandomQuizzes) return currentTheme.primary;
    return quiz.status === 'Solved' ? currentTheme.success : currentTheme.warning;
  };

  const getQuizStatusText = (quiz: any) => {
    if (showingRandomQuizzes) return 'Unsolved';
    return quiz.status === 'Solved' ? 'Solved' : 'Available';
  };

  // Show loading only when we're loading and have no data
  if (isLoading && quizList.length === 0 && quizzes.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
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
            <Quiz sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              {showingRandomQuizzes ? 'Random Unsolved Quizzes' : 'Quiz Selection'}
            </Typography>
          </Box>
          {showingRandomQuizzes && (
            <IconButton
              onClick={handleBackToAllQuizzes}
              sx={{ color: currentTheme.textPrimary }}
            >
              <Refresh />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700, mb: 1 }}>
            {showingRandomQuizzes ? 'Random Unsolved Quizzes' : 'Quiz Selection'}
          </Typography>
          <Typography variant="body1" sx={{ color: currentTheme.textSecondary }}>
            {showingRandomQuizzes 
              ? 'Personalized quiz recommendations based on your progress'
              : 'Choose from available quizzes or generate new ones'
            }
          </Typography>
        </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Random Quizzes Section */}
      {showingRandomQuizzes && (
        <Card sx={{ mb: 3, backgroundColor: currentTheme.accent + '10', border: `1px solid ${currentTheme.accent}30` }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Shuffle sx={{ color: currentTheme.accent, mr: 1 }} />
              <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                {quizzes.length} Random Unsolved Quizzes
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
              Selected specifically for you based on your learning progress!
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleBackToAllQuizzes}
              sx={{ color: currentTheme.accent, borderColor: currentTheme.accent }}
            >
              Back to All Quizzes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generate Random Quizzes Button */}
      {!showingRandomQuizzes && (
        <Card sx={{ mb: 3, backgroundColor: currentTheme.surface }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Shuffle sx={{ color: currentTheme.accent, mr: 1 }} />
              <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                Get Personalized Quizzes
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
              Get random unsolved quizzes tailored to your learning progress!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Shuffle />}
              onClick={handleGenerateRandomQuizzes}
              sx={{ 
                bgcolor: currentTheme.accent,
                '&:hover': {
                  bgcolor: currentTheme.accent,
                  opacity: 0.9,
                },
              }}
            >
              Generate Random Quizzes
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters Section */}
      {!showingRandomQuizzes && (
        <Card sx={{ mb: 3, backgroundColor: currentTheme.surface }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600, mb: 2 }}>
              Filter Quizzes
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Knowledge Level</InputLabel>
                <Select
                  value={selectedKnowledgeLevel}
                  label="Knowledge Level"
                  onChange={(e) => {
                    setSelectedKnowledgeLevel(e.target.value);
                    handleFilterChange();
                  }}
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {knowledgeLevels.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Topic</InputLabel>
                <Select
                  value={selectedTopic}
                  label="Topic"
                  onChange={(e) => {
                    setSelectedTopic(e.target.value);
                    handleFilterChange();
                  }}
                >
                  <MenuItem value="">All Topics</MenuItem>
                  {topics.map((topic) => (
                    <MenuItem key={topic} value={topic}>
                      {topic}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      {!showingRandomQuizzes && (
        <Card sx={{ mb: 3, backgroundColor: currentTheme.surface }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<Shuffle />}
                onClick={handleGenerateRandomQuizzes}
                sx={{ flex: 1 }}
              >
                Generate Random Quizzes
              </Button>
              <Button
                variant="outlined"
                startIcon={<Psychology />}
                onClick={() => navigate('/chatbot')}
                sx={{ flex: 1 }}
              >
                Ask AI Assistant
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Quiz List */}
      <Box>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : getQuizzesToShow().length === 0 ? (
          <Card sx={{ backgroundColor: currentTheme.surface }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
                No quizzes available
              </Typography>
              <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 3 }}>
                {showingRandomQuizzes 
                  ? 'Try generating random quizzes or check back later for new content.'
                  : 'No quizzes match your current filters. Try adjusting your selection.'
                }
              </Typography>
              {!showingRandomQuizzes && (
                <Button
                  variant="contained"
                  startIcon={<Shuffle />}
                  onClick={handleGenerateRandomQuizzes}
                >
                  Generate Random Quizzes
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <List>
            {getQuizzesToShow().map((quiz, index) => (
              <ListItem
                key={quiz.id || index}
                component={Card}
                sx={{
                  mb: 2,
                  backgroundColor: currentTheme.surface,
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <CardContent sx={{ width: '100%', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: getQuizStatusColor(quiz),
                          mr: 2,
                        }}
                      >
                        {showingRandomQuizzes ? index + 1 : quiz.questionNumber || '?'}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                          {quiz.question || quiz.title || `Question ${quiz.questionNumber || index + 1}`}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={quiz.topic || quiz.category || 'General'}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={quiz.knowledgeLevel || quiz.difficulty || 'Medium'}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={getQuizStatusText(quiz)}
                            size="small"
                            sx={{
                              bgcolor: getQuizStatusColor(quiz) + '20',
                              color: getQuizStatusColor(quiz),
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => handleStartQuiz(quiz)}
                      sx={{
                        bgcolor: currentTheme.primary,
                        '&:hover': {
                          bgcolor: currentTheme.primary,
                          opacity: 0.9,
                        },
                      }}
                    >
                      Start Quiz
                    </Button>
                  </Box>
                </CardContent>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Stats Summary */}
      {profile && !showingRandomQuizzes && (
        <Card sx={{ mt: 3, backgroundColor: currentTheme.surface }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600, mb: 2 }}>
              Your Progress
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" sx={{ color: currentTheme.primary, fontWeight: 700 }}>
                  {profile.streak || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                  Day Streak
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" sx={{ color: currentTheme.success, fontWeight: 700 }}>
                  {profile.totalScore || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                  Total Score
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography variant="h4" sx={{ color: currentTheme.warning, fontWeight: 700 }}>
                  {profile.quizzesCompleted || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                  Quizzes Completed
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
    </Box>
  );
};

export default QuizPlayScreen; 