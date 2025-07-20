import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  IconButton as MuiIconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  Create,
  ArrowBack,
  Add,
  Delete,
  Save,
  Quiz,
  QuestionAnswer,
  Timer,
  Category,
  School,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useQuiz } from '../contexts/QuizContext';
import { QuizCategories, QuizDifficulties } from '../utils/constants';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

const CreateQuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();
  const { createQuiz } = useQuiz();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuestionDialog, setShowQuestionDialog] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Quiz form state
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    timeLimit: 30,
  });

  // Question form state
  const [questionData, setQuestionData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
  });

  const [questions, setQuestions] = useState<Question[]>([]);

  const handleQuizDataChange = (field: string, value: any) => {
    setQuizData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionDataChange = (field: string, value: any) => {
    setQuestionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionData.options];
    newOptions[index] = value;
    setQuestionData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleAddQuestion = () => {
    if (!questionData.question.trim() || questionData.options.some(opt => !opt.trim())) {
      setError('Please fill in all question fields');
      return;
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation,
    };

    setQuestions(prev => [...prev, newQuestion]);
    resetQuestionForm();
    setShowQuestionDialog(false);
  };

  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setQuestionData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
    });
    setEditingQuestionIndex(index);
    setShowQuestionDialog(true);
  };

  const handleUpdateQuestion = () => {
    if (editingQuestionIndex === null) return;

    if (!questionData.question.trim() || questionData.options.some(opt => !opt.trim())) {
      setError('Please fill in all question fields');
      return;
    }

    const updatedQuestions = [...questions];
    updatedQuestions[editingQuestionIndex] = {
      ...updatedQuestions[editingQuestionIndex],
      question: questionData.question,
      options: questionData.options,
      correctAnswer: questionData.correctAnswer,
      explanation: questionData.explanation,
    };

    setQuestions(updatedQuestions);
    resetQuestionForm();
    setShowQuestionDialog(false);
    setEditingQuestionIndex(null);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const resetQuestionForm = () => {
    setQuestionData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
    });
  };

  const handleSaveQuiz = async () => {
    if (!quizData.title.trim() || !quizData.description.trim() || !quizData.category || !quizData.difficulty) {
      setError('Please fill in all quiz fields');
      return;
    }

    if (questions.length === 0) {
      setError('Please add at least one question');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const quizPayload = {
        ...quizData,
        questions,
        createdBy: user?.userId,
      };

      const result = await createQuiz(quizPayload);
      if (result) {
        navigate('/');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      quizData.title.trim() &&
      quizData.description.trim() &&
      quizData.category &&
      quizData.difficulty &&
      questions.length > 0
    );
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
            onClick={() => navigate('/')}
            sx={{ color: currentTheme.textPrimary, mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Create sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              Create Quiz
            </Typography>
          </Box>
          <Button
            startIcon={<Save />}
            onClick={handleSaveQuiz}
            disabled={!isFormValid() || isLoading}
            variant="contained"
            sx={{
              backgroundColor: currentTheme.primary,
              '&:hover': {
                backgroundColor: currentTheme.primary,
                opacity: 0.9,
              },
            }}
          >
            {isLoading ? <CircularProgress size={16} /> : 'Save Quiz'}
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 4 }}>
          {/* Quiz Details */}
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
                Quiz Details
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  value={quizData.title}
                  onChange={(e) => handleQuizDataChange('title', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Description"
                  value={quizData.description}
                  onChange={(e) => handleQuizDataChange('description', e.target.value)}
                  multiline
                  rows={3}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={quizData.category}
                    onChange={(e) => handleQuizDataChange('category', e.target.value)}
                    sx={{
                      backgroundColor: currentTheme.background,
                    }}
                  >
                    {QuizCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={quizData.difficulty}
                    onChange={(e) => handleQuizDataChange('difficulty', e.target.value)}
                    sx={{
                      backgroundColor: currentTheme.background,
                    }}
                  >
                    {QuizDifficulties.map((difficulty) => (
                      <MenuItem key={difficulty} value={difficulty}>
                        {difficulty}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Time Limit (minutes)"
                  type="number"
                  value={quizData.timeLimit}
                  onChange={(e) => handleQuizDataChange('timeLimit', parseInt(e.target.value))}
                  inputProps={{ min: 1, max: 180 }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Paper>

          {/* Questions List */}
          <Paper sx={{ backgroundColor: currentTheme.surface }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: currentTheme.textPrimary,
                    fontWeight: 600,
                  }}
                >
                  Questions ({questions.length})
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={() => setShowQuestionDialog(true)}
                  variant="outlined"
                  sx={{
                    borderColor: currentTheme.primary,
                    color: currentTheme.primary,
                    '&:hover': {
                      borderColor: currentTheme.primary,
                      backgroundColor: currentTheme.primary + '10',
                    },
                  }}
                >
                  Add Question
                </Button>
              </Box>

              {questions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, color: currentTheme.textSecondary }}>
                  <QuestionAnswer sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom>
                    No Questions Yet
                  </Typography>
                  <Typography variant="body2">
                    Add your first question to get started.
                  </Typography>
                </Box>
              ) : (
                <List>
                  {questions.map((question, index) => (
                    <React.Fragment key={question.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ color: currentTheme.textPrimary, fontWeight: 500 }}>
                              {index + 1}. {question.question}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              {question.options.map((option, optIndex) => (
                                <Typography
                                  key={optIndex}
                                  variant="body2"
                                  sx={{
                                    color: optIndex === question.correctAnswer ? currentTheme.success : currentTheme.textSecondary,
                                    fontWeight: optIndex === question.correctAnswer ? 600 : 400,
                                  }}
                                >
                                  {String.fromCharCode(65 + optIndex)}. {option}
                                </Typography>
                              ))}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <MuiIconButton
                              size="small"
                              onClick={() => handleEditQuestion(index)}
                              sx={{
                                color: currentTheme.primary,
                                '&:hover': {
                                  backgroundColor: currentTheme.primary + '10',
                                },
                              }}
                            >
                              <Create sx={{ fontSize: 16 }} />
                            </MuiIconButton>
                            <MuiIconButton
                              size="small"
                              onClick={() => handleDeleteQuestion(index)}
                              sx={{
                                color: currentTheme.error,
                                '&:hover': {
                                  backgroundColor: currentTheme.error + '10',
                                },
                              }}
                            >
                              <Delete sx={{ fontSize: 16 }} />
                            </MuiIconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < questions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Paper>
        </Box>
      </Container>

      {/* Question Dialog */}
      <Dialog
        open={showQuestionDialog}
        onClose={() => {
          setShowQuestionDialog(false);
          setEditingQuestionIndex(null);
          resetQuestionForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ color: currentTheme.textPrimary }}>
          {editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Question"
              value={questionData.question}
              onChange={(e) => handleQuestionDataChange('question', e.target.value)}
              multiline
              rows={3}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: currentTheme.background,
                },
              }}
            />

            <Typography variant="subtitle2" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
              Options
            </Typography>

            {questionData.options.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ color: currentTheme.textSecondary, minWidth: 20 }}>
                  {String.fromCharCode(65 + index)}.
                </Typography>
                <TextField
                  fullWidth
                  label={`Option ${String.fromCharCode(65 + index)}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
              </Box>
            ))}

            <FormControl fullWidth>
              <InputLabel>Correct Answer</InputLabel>
              <Select
                value={questionData.correctAnswer}
                onChange={(e) => handleQuestionDataChange('correctAnswer', e.target.value)}
                sx={{
                  backgroundColor: currentTheme.background,
                }}
              >
                {questionData.options.map((_, index) => (
                  <MenuItem key={index} value={index}>
                    {String.fromCharCode(65 + index)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Explanation (Optional)"
              value={questionData.explanation}
              onChange={(e) => handleQuestionDataChange('explanation', e.target.value)}
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: currentTheme.background,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowQuestionDialog(false);
              setEditingQuestionIndex(null);
              resetQuestionForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={editingQuestionIndex !== null ? handleUpdateQuestion : handleAddQuestion}
            variant="contained"
            sx={{
              backgroundColor: currentTheme.primary,
              '&:hover': {
                backgroundColor: currentTheme.primary,
                opacity: 0.9,
              },
            }}
          >
            {editingQuestionIndex !== null ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateQuizScreen; 