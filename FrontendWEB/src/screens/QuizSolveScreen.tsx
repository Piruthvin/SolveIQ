import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Cancel,
  Lightbulb,
  Timer,
  Quiz,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { ApiEndpoints } from '../utils/constants';
import axios from 'axios';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | string;
  explanation?: string;
}

interface QuizData {
  id: string;
  title: string;
  description: string;
  topic: string;
  questions: QuizQuestion[];
}

const QuizSolveScreen: React.FC = () => {
  const navigate = useNavigate();
  const { quizId } = useParams<{ quizId: string }>();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();
  const { fetchProfile } = useProfile();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes default
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const fetchQuiz = async () => {
    if (!quizId || !token) return;

    try {
      console.log('QuizSolveScreen: Fetching quiz...');
      const response = await axios.get(`${ApiEndpoints.quiz}/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('QuizSolveScreen: Quiz response:', response.data);
      setQuiz(response.data);
    } catch (error: any) {
      console.error('QuizSolveScreen: Error fetching quiz:', error);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoSubmit = () => {
    if (selectedAnswer && !isSubmitting) {
      submitAnswer();
    }
  };

  const submitAnswer = async () => {
    if (!selectedAnswer || !quiz || !user?.userId || !token) return;

    setIsSubmitting(true);
    try {
      console.log('QuizSolveScreen: Submitting answer...');
      const response = await axios.post(`${ApiEndpoints.quiz}/solve`, {
        userId: user.userId,
        quizId: quiz.id,
        answer: selectedAnswer,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('QuizSolveScreen: Submit response:', response.data);
      
      const correct = response.data.correct;
      setIsCorrect(correct);
      setResultMessage(correct ? 'Correct!' : 'Incorrect!');
      setExplanation(correct ? response.data.explanation : null);
      setTimerActive(false);

             // Refresh profile data to update streak and stats if answer is correct
       if (correct && user.userId) {
         console.log('QuizSolveScreen: Answer is correct, refreshing profile...');
         await fetchProfile();
       }
    } catch (error: any) {
      console.error('QuizSolveScreen: Error submitting answer:', error);
      setError('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 30) return currentTheme.error;
    if (timeLeft <= 60) return currentTheme.warning;
    return currentTheme.textSecondary;
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        backgroundColor: currentTheme.background, 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress sx={{ color: currentTheme.primary }} />
      </Box>
    );
  }

  if (error || !quiz) {
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
              Quiz
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">
            {error || 'Quiz not found'}
          </Alert>
        </Container>
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
              flexGrow: 1,
            }}
          >
            Solve
          </Typography>
          
          {/* Timer */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Timer sx={{ color: getTimeColor() }} />
            <Typography
              variant="body2"
              sx={{ 
                color: getTimeColor(),
                fontWeight: 600,
                fontFamily: 'monospace',
              }}
            >
              {formatTime(timeLeft)}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Card
          sx={{
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.textSecondary}10`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            {/* Quiz Header */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  color: currentTheme.textPrimary,
                  fontWeight: 700,
                  mb: 1,
                }}
              >
                {quiz.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Quiz sx={{ color: currentTheme.primary, fontSize: 20 }} />
                <Chip
                  label={quiz.topic}
                  size="small"
                  sx={{
                    bgcolor: currentTheme.primary + '10',
                    color: currentTheme.primary,
                    fontWeight: 600,
                  }}
                />
              </Box>

              {quiz.description && (
                <Typography
                  variant="body2"
                  sx={{ color: currentTheme.textSecondary }}
                >
                  {quiz.description}
                </Typography>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Question */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  color: currentTheme.textPrimary,
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                {(() => {
                  const quizData = quiz as any;
                  // Try different possible question structures
                  if (quizData.questions && quizData.questions.length > 0) {
                    return quizData.questions[0].question;
                  } else if (quizData.question) {
                    return quizData.question;
                  } else {
                    return 'Question not available';
                  }
                })()}
              </Typography>

              {/* Options */}
              {(() => {
                const quizData = quiz as any;
                let options: string[] = [];
                
                // Try different possible structures
                if (quizData?.questions?.[0]?.options) {
                  options = quizData.questions[0].options;
                } else if (quizData?.options) {
                  options = quizData.options;
                } else if (quizData?.option1 || quizData?.option2 || quizData?.option3 || quizData?.option4) {
                  options = [
                    quizData.option1,
                    quizData.option2,
                    quizData.option3,
                    quizData.option4
                  ].filter(option => option && option.trim() !== '');
                }
                
                console.log('QuizSolveScreen: Quiz data:', quizData);
                console.log('QuizSolveScreen: Options found:', options);
                
                if (options.length > 0) {
                  return (
                    <FormControl component="fieldset" fullWidth>
                      <RadioGroup
                        value={selectedAnswer}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                      >
                        {options.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            value={option}
                            control={
                              <Radio
                                sx={{
                                  color: currentTheme.textSecondary,
                                  '&.Mui-checked': {
                                    color: currentTheme.primary,
                                  },
                                }}
                              />
                            }
                            label={
                              <Typography
                                sx={{
                                  color: currentTheme.textPrimary,
                                  fontSize: '1rem',
                                }}
                              >
                                {option}
                              </Typography>
                            }
                            sx={{
                              mb: 2,
                              p: 2,
                              borderRadius: 2,
                              border: `1px solid ${currentTheme.textSecondary}20`,
                              backgroundColor: currentTheme.background,
                              '&:hover': {
                                backgroundColor: currentTheme.primary + '05',
                                borderColor: currentTheme.primary + '30',
                              },
                              '&.Mui-checked': {
                                backgroundColor: currentTheme.primary + '10',
                                borderColor: currentTheme.primary,
                              },
                            }}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  );
                } else {
                  return (
                    <Typography variant="body2" sx={{ color: currentTheme.textSecondary, textAlign: 'center' }}>
                      No options available for this quiz
                    </Typography>
                  );
                }
              })()}
            </Box>

            {/* Result Display */}
            {resultMessage && (
              <Box sx={{ mb: 3 }}>
                <Alert
                  severity={isCorrect ? 'success' : 'error'}
                  icon={isCorrect ? <CheckCircle /> : <Cancel />}
                  sx={{ mb: 2 }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {resultMessage}
                  </Typography>
                  <Typography variant="body2">
                    Your answer: {selectedAnswer}
                  </Typography>
                </Alert>

                {explanation && (
                  <Card
                    sx={{
                      backgroundColor: currentTheme.success + '10',
                      border: `1px solid ${currentTheme.success}30`,
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Lightbulb sx={{ color: currentTheme.success, mr: 1 }} />
                        <Typography
                          variant="subtitle2"
                          sx={{ color: currentTheme.success, fontWeight: 600 }}
                        >
                          Explanation
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ color: currentTheme.textPrimary }}
                      >
                        {explanation}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}

            {/* Submit Button */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  borderColor: currentTheme.textSecondary + '30',
                  color: currentTheme.textPrimary,
                  '&:hover': {
                    borderColor: currentTheme.textSecondary,
                  },
                }}
              >
                Back
              </Button>
              
              <Button
                variant="contained"
                onClick={submitAnswer}
                disabled={!selectedAnswer || isSubmitting || resultMessage !== null}
                sx={{
                  flex: 1,
                  bgcolor: currentTheme.primary,
                  '&:hover': {
                    bgcolor: currentTheme.primary,
                    opacity: 0.9,
                  },
                  '&:disabled': {
                    bgcolor: currentTheme.textSecondary + '30',
                  },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                ) : resultMessage ? (
                  'Completed'
                ) : (
                  'Submit Answer'
                )}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default QuizSolveScreen; 