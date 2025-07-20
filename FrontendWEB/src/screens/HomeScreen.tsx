import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  AppBar,
  Toolbar,
  Chip,
} from '@mui/material';
import {
  Home,
  NotificationsOutlined,
  PersonOutline,
  Quiz,
  CheckCircle,
  PlayCircle,
  TrendingUp,
  Shuffle,
  School,
  Link,
  Close,
  NavigateNext,
  NavigateBefore,
  EmojiEvents,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useQuiz } from '../contexts/QuizContext';
import { useProfile } from '../contexts/ProfileContext';
import { useChatbot } from '../contexts/ChatbotContext';
import { ApiEndpoints } from '../utils/constants';
import axios from 'axios';

interface HomeStats {
  totalQuizzes: number;
  solved: number;
  topicsCount: number;
}

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();
  const { quizzes, fetchRandomUnsolvedQuizzes, clearRandomQuizzes } = useQuiz();
  const { profile } = useProfile();
  const { sendMessage } = useChatbot();

  const [stats, setStats] = useState<HomeStats>({
    totalQuizzes: 0,
    solved: 0,
    topicsCount: 0,
  });
  const [showingRandomQuizzes, setShowingRandomQuizzes] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user?.userId) {
      fetchHomeStats();
    }
  }, [user]);

  const fetchHomeStats = async () => {
    if (!user?.userId || !token) return;

    try {
      console.log('HomeScreen: Fetching home stats...');
      const response = await axios.get(`${ApiEndpoints.baseUrl}/stats/home?userId=${user.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('HomeScreen: Stats response:', response.data);
      setStats({
        totalQuizzes: response.data.totalQuizzes || 0,
        solved: response.data.solved || 0,
        topicsCount: response.data.topicsCount || 0,
      });
    } catch (error: any) {
      console.error('HomeScreen: Error fetching stats:', error);
      setError('Failed to fetch home statistics');
    }
  };

  const showRandomQuizzesDialog = () => {
    const topic = prompt('Topic (Optional) - Leave empty for any topic:') || '';
    const numQuestions = prompt('Number of Questions (default: 5):') || '5';
    const count = parseInt(numQuestions) || 5;

    getRandomQuizzes(topic || undefined, count);
  };

  const getRandomQuizzes = async (topic?: string, count: number = 5) => {
    if (!user?.userId || !token) {
      setSnackbar({ message: 'Please login to get random quizzes', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      console.log('HomeScreen: Getting random quizzes...');
      await fetchRandomUnsolvedQuizzes({ topic, count });
      setShowingRandomQuizzes(true);
      setCurrentQuizIndex(0);
    } catch (error) {
      console.error('HomeScreen: Error getting random quizzes:', error);
      setSnackbar({ message: 'Failed to get random quizzes', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const solveQuiz = async (quiz: any, selectedAnswer: string) => {
    if (!user?.userId || !token) return;

    try {
      console.log('HomeScreen: Solving quiz...');
      const response = await axios.post(`${ApiEndpoints.quiz}/solve`, {
        userId: user.userId,
        quizId: quiz.id,
        answer: selectedAnswer,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('HomeScreen: Quiz solve response:', response.data);
      const isCorrect = response.data.correct;
      const explanation = response.data.explanation;

      // Show result dialog
      showQuizResultDialog(isCorrect, explanation, selectedAnswer, quiz);
    } catch (error) {
      console.error('HomeScreen: Error solving quiz:', error);
      setSnackbar({ message: 'Failed to submit answer', type: 'error' });
    }
  };

  const showQuizResultDialog = (isCorrect: boolean, explanation: string, selectedAnswer: string, quiz: any) => {
    const message = isCorrect ? 'Correct!' : 'Incorrect';
    const details = `Your answer: ${selectedAnswer}`;
    
    if (isCorrect && explanation) {
      alert(`${message}\n${details}\n\nExplanation: ${explanation}`);
    } else {
      alert(`${message}\n${details}`);
    }

    // Move to next quiz or finish
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      refreshRandomQuizzes();
    }
  };

  const refreshRandomQuizzes = async () => {
    if (!user?.userId || !token) return;

    try {
      await fetchRandomUnsolvedQuizzes({ count: 5 });
      setCurrentQuizIndex(0);
      setSnackbar({ message: 'Refreshed with new random quizzes!', type: 'success' });
    } catch (error) {
      console.error('HomeScreen: Error refreshing quizzes:', error);
      setSnackbar({ message: 'Failed to refresh quizzes', type: 'error' });
    }
  };

  const showJoinClassroomDialog = () => {
    const joinLink = prompt('Enter Join Link:');
    if (joinLink && user?.userId && token) {
      joinClassroom(joinLink);
    }
  };

  const joinClassroom = async (joinLink: string) => {
    if (!user?.userId || !token) return;

    try {
      const response = await axios.post(
        `${ApiEndpoints.classroom}/join?joinLink=${joinLink}&studentId=${user.userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setSnackbar({ message: 'Joined classroom successfully!', type: 'success' });
        navigate('/classroom');
      } else {
        setSnackbar({ message: 'Failed to join classroom', type: 'error' });
      }
    } catch (error) {
      console.error('HomeScreen: Error joining classroom:', error);
      setSnackbar({ message: 'Failed to join classroom', type: 'error' });
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '🌙';
    if (streak === 1) return '🔥';
    return '🔥'.repeat(Math.min(streak, 5)); // Max 5 fire emojis
  };

  const getDisplayName = () => {
    const userName = user?.name?.trim();
    return (userName && userName.length > 0) ? userName : (user?.email || 'User');
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>Loading...</Typography>
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
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Home sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              SolveIQ
            </Typography>
          </Box>
          <IconButton
            onClick={() => {/* Notifications feature coming soon */}}
            sx={{ color: currentTheme.textPrimary, mr: 1 }}
          >
            <NotificationsOutlined />
          </IconButton>
          <IconButton
            onClick={() => navigate('/search-profile')}
            sx={{ color: currentTheme.textPrimary }}
          >
            <PersonOutline />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Welcome Section */}
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
                  width: 48,
                  height: 48,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  mr: 2,
                  fontSize: 24,
                  fontWeight: 'bold',
                }}
              >
                {getDisplayName()[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Welcome back,
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {getDisplayName()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Card sx={{ flex: 1, backgroundColor: currentTheme.info + '10', border: `1px solid ${currentTheme.info}30` }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Quiz sx={{ color: currentTheme.info, fontSize: 24, mb: 1 }} />
              <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                {stats.totalQuizzes}
              </Typography>
              <Typography variant="caption" sx={{ color: currentTheme.textSecondary }}>
                Total Quizzes
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, backgroundColor: currentTheme.success + '10', border: `1px solid ${currentTheme.success}30` }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <CheckCircle sx={{ color: currentTheme.success, fontSize: 24, mb: 1 }} />
              <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                {stats.solved}
              </Typography>
              <Typography variant="caption" sx={{ color: currentTheme.textSecondary }}>
                Solved
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, backgroundColor: currentTheme.warning + '10', border: `1px solid ${currentTheme.warning}30` }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <PlayCircle sx={{ color: currentTheme.warning, fontSize: 24, mb: 1 }} />
              <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                {stats.topicsCount}
              </Typography>
              <Typography variant="caption" sx={{ color: currentTheme.textSecondary }}>
                Topics
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Streak Section */}
        {profile && (
          <Card sx={{ mb: 3, backgroundColor: currentTheme.surface }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: currentTheme.primary + '10',
                    borderRadius: 2,
                    mr: 2,
                  }}
                >
                  <Typography variant="h4">
                    {getStreakEmoji(profile.streak || 0)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                    Current Streak
                  </Typography>
                  <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700 }}>
                    {profile.streak || 0} days
                  </Typography>
                  <Typography variant="body2" sx={{ color: currentTheme.success }}>
                    Keep it up! 🔥
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                startIcon={<TrendingUp />}
                onClick={() => navigate('/profile')}
                sx={{ mt: 2, width: '100%' }}
              >
                View Full Streak
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Chatbot Section */}
        <Card sx={{ mb: 3, backgroundColor: currentTheme.surface }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600, mb: 2 }}>
              AI Assistant
            </Typography>
            <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
              Get help with your studies and quiz preparation
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/chatbot')}
              sx={{
                bgcolor: currentTheme.primary,
                '&:hover': {
                  bgcolor: currentTheme.primary,
                  opacity: 0.9,
                },
              }}
            >
              Open AI Assistant
            </Button>
          </CardContent>
        </Card>

        {/* Random Quizzes Section */}
        <Card sx={{ mb: 3, backgroundColor: currentTheme.accent + '10', border: `1px solid ${currentTheme.accent}30` }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Shuffle sx={{ color: currentTheme.accent, mr: 1 }} />
              <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                Random Unsolved Quizzes
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
              Get random quizzes you haven't solved yet
            </Typography>
            <Button
              variant="contained"
              onClick={showRandomQuizzesDialog}
              sx={{
                bgcolor: currentTheme.accent,
                '&:hover': {
                  bgcolor: currentTheme.accent,
                  opacity: 0.9,
                },
              }}
            >
              Get Random Quizzes
            </Button>
          </CardContent>
        </Card>

        {/* Random Quiz Display */}
        {showingRandomQuizzes && quizzes.length > 0 && (
          <Card sx={{ mb: 3, backgroundColor: currentTheme.surface }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Quiz sx={{ color: currentTheme.accent, mr: 1 }} />
                <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                  Random Quiz {currentQuizIndex + 1}/{quizzes.length}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <IconButton
                  onClick={() => {
                    setShowingRandomQuizzes(false);
                    setCurrentQuizIndex(0);
                    clearRandomQuizzes();
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
              
              <Typography variant="body1" sx={{ color: currentTheme.textPrimary, mb: 2, fontWeight: 500 }}>
                {quizzes[currentQuizIndex]?.question || ''}
              </Typography>
              
              <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 3 }}>
                Topic: {quizzes[currentQuizIndex]?.topic || ''}
              </Typography>

              {/* Quiz Options */}
              <Box sx={{ mb: 3 }}>
                {(() => {
                  const currentQuiz = quizzes[currentQuizIndex] as any;
                  let options: string[] = [];
                  
                  // Try different possible structures
                  if (currentQuiz?.questions?.[0]?.options) {
                    options = currentQuiz.questions[0].options;
                  } else if (currentQuiz?.options) {
                    options = currentQuiz.options;
                  } else if (currentQuiz?.option1 || currentQuiz?.option2 || currentQuiz?.option3 || currentQuiz?.option4) {
                    options = [
                      currentQuiz.option1,
                      currentQuiz.option2,
                      currentQuiz.option3,
                      currentQuiz.option4
                    ].filter(option => option && option.trim() !== '');
                  }
                  
                  console.log('HomeScreen: Current quiz:', currentQuiz);
                  console.log('HomeScreen: Options found:', options);
                  
                  if (options.length > 0) {
                    return options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        fullWidth
                        onClick={() => solveQuiz(currentQuiz, option)}
                        sx={{
                          mb: 1,
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          borderColor: currentTheme.textSecondary + '30',
                          color: currentTheme.textPrimary,
                          '&:hover': {
                            borderColor: currentTheme.primary,
                            backgroundColor: currentTheme.primary + '10',
                          },
                        }}
                      >
                        {option}
                      </Button>
                    ));
                  } else {
                    return (
                      <Typography variant="body2" sx={{ color: currentTheme.textSecondary, textAlign: 'center' }}>
                        No options available for this quiz
                      </Typography>
                    );
                  }
                })()}
              </Box>

              {/* Navigation */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                {currentQuizIndex > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<NavigateBefore />}
                    onClick={() => setCurrentQuizIndex(currentQuizIndex - 1)}
                    sx={{ flex: 1 }}
                  >
                    Previous
                  </Button>
                )}
                <Button
                  variant="contained"
                  endIcon={currentQuizIndex < quizzes.length - 1 ? <NavigateNext /> : <EmojiEvents />}
                  onClick={() => {
                    if (currentQuizIndex < quizzes.length - 1) {
                      setCurrentQuizIndex(currentQuizIndex + 1);
                    } else {
                      refreshRandomQuizzes();
                    }
                  }}
                  sx={{ flex: 1 }}
                >
                  {currentQuizIndex < quizzes.length - 1 ? 'Next' : 'Finish'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Classroom Buttons */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<School />}
            onClick={() => navigate('/classroom')}
            sx={{
              bgcolor: currentTheme.primary,
              py: 1.5,
              '&:hover': {
                bgcolor: currentTheme.primary,
                opacity: 0.9,
              },
            }}
          >
            Go to Classroom
          </Button>
          
          <Button
            variant="contained"
            startIcon={<Link />}
            onClick={showJoinClassroomDialog}
            sx={{
              bgcolor: currentTheme.accent,
              py: 1.5,
              '&:hover': {
                bgcolor: currentTheme.accent,
                opacity: 0.9,
              },
            }}
          >
            Join Classroom
          </Button>
        </Box>
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!snackbar}
        autoHideDuration={6000}
        onClose={() => setSnackbar(null)}
      >
        <Alert
          onClose={() => setSnackbar(null)}
          severity={snackbar?.type || 'info'}
          sx={{ width: '100%' }}
        >
          {snackbar?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HomeScreen; 