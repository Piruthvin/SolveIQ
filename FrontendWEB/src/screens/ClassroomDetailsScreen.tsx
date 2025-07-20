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
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  School,
  ArrowBack,
  People,
  Quiz,
  Assignment,
  Settings,
  Add,
  Edit,
  Delete,
  Person,
  EmojiEvents,
  TrendingUp,
  CalendarToday,
  MoreVert,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/axiosConfig';

interface ClassroomMember {
  userId: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  joinedAt: string;
  profilePicture?: string;
}

interface ClassroomQuiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  questionCount: number;
  createdAt: string;
  isActive: boolean;
}

interface Classroom {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  creatorName: string;
  members: ClassroomMember[];
  maxMembers: number;
  category: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  quizzes: ClassroomQuiz[];
  joinCode: string;
}

const ClassroomDetailsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { classroomId } = useParams<{ classroomId: string }>();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();

  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showAddQuizDialog, setShowAddQuizDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    if (classroomId) {
      fetchClassroomDetails();
    }
  }, [classroomId]);

  const fetchClassroomDetails = async () => {
    if (!classroomId || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(`/classrooms/${classroomId}`);
      setClassroom(response.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch classroom details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!classroomId || !token) return;

    if (!window.confirm('Are you sure you want to remove this member?')) return;

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/classrooms/${classroomId}/members/${userId}`);
      fetchClassroomDetails(); // Refresh data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to remove member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeMemberRole = async (userId: string, newRole: string) => {
    if (!classroomId || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      await apiClient.patch(`/classrooms/${classroomId}/members/${userId}/role`, {
        role: newRole
      });
      fetchClassroomDetails(); // Refresh data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to change member role');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = () => {
    if (!classroom || !user) return false;
    const member = classroom.members.find(m => m.userId === user.userId);
    return member?.role === 'ADMIN' || classroom.createdBy === user.userId;
  };

  const isTeacher = () => {
    if (!classroom || !user) return false;
    const member = classroom.members.find(m => m.userId === user.userId);
    return member?.role === 'TEACHER' || member?.role === 'ADMIN' || classroom.createdBy === user.userId;
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return currentTheme.error;
      case 'TEACHER':
        return currentTheme.warning;
      case 'STUDENT':
        return currentTheme.primary;
      default:
        return currentTheme.textSecondary;
    }
  };

  if (!classroomId) {
    return (
      <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ color: currentTheme.textPrimary }}>
          Classroom ID not found
        </Typography>
      </Box>
    );
  }

  if (isLoading && !classroom) {
    return (
      <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!classroom) {
    return (
      <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" sx={{ color: currentTheme.textPrimary }}>
          Classroom not found
        </Typography>
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
            onClick={() => navigate('/classrooms')}
            sx={{ color: currentTheme.textPrimary, mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <School sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              {classroom.name}
            </Typography>
          </Box>
          {isAdmin() && (
            <Button
              startIcon={<Settings />}
              onClick={() => setShowSettingsDialog(true)}
              sx={{
                color: currentTheme.primary,
                '&:hover': {
                  backgroundColor: currentTheme.primary + '10',
                },
              }}
            >
              Settings
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Classroom Info */}
        <Paper sx={{ mb: 4, backgroundColor: currentTheme.surface }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ color: currentTheme.textPrimary, fontWeight: 700, mb: 1 }}>
                  {classroom.name}
                </Typography>
                <Typography variant="body1" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
                  {classroom.description}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={classroom.category}
                    size="small"
                    sx={{
                      backgroundColor: currentTheme.primary + '20',
                      color: currentTheme.primary,
                    }}
                  />
                  <Chip
                    label={`${classroom.members.length}/${classroom.maxMembers} members`}
                    size="small"
                    icon={<People />}
                    sx={{
                      backgroundColor: currentTheme.success + '20',
                      color: currentTheme.success,
                    }}
                  />
                  {classroom.isPrivate && (
                    <Chip
                      label="Private"
                      size="small"
                      sx={{
                        backgroundColor: currentTheme.warning + '20',
                        color: currentTheme.warning,
                      }}
                    />
                  )}
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                  Created by {classroom.creatorName}
                </Typography>
                <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                  {new Date(classroom.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ backgroundColor: currentTheme.surface, mb: 4 }}>
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
            <Tab label="Members" icon={<People />} />
            <Tab label="Quizzes" icon={<Quiz />} />
            <Tab label="Activities" icon={<TrendingUp />} />
          </Tabs>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                    Members ({classroom.members.length})
                  </Typography>
                  {isAdmin() && (
                    <Button
                      startIcon={<Add />}
                      onClick={() => setShowInviteDialog(true)}
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
                      Invite Member
                    </Button>
                  )}
                </Box>

                <List>
                  {classroom.members.map((member, index) => (
                    <React.Fragment key={member.userId}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            src={member.profilePicture}
                            sx={{
                              backgroundColor: currentTheme.primary,
                            }}
                          >
                            <Person />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography variant="body1" sx={{ color: currentTheme.textPrimary, fontWeight: 500 }}>
                                {member.name}
                              </Typography>
                              <Chip
                                label={member.role}
                                size="small"
                                sx={{
                                  backgroundColor: getRoleColor(member.role) + '20',
                                  color: getRoleColor(member.role),
                                  fontWeight: 600,
                                }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </Typography>
                          }
                        />
                        {isAdmin() && member.userId !== user?.userId && (
                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <FormControl size="small">
                                <Select
                                  value={member.role}
                                  onChange={(e) => handleChangeMemberRole(member.userId, e.target.value)}
                                  sx={{
                                    backgroundColor: currentTheme.background,
                                    minWidth: 100,
                                  }}
                                >
                                  <MenuItem value="STUDENT">Student</MenuItem>
                                  <MenuItem value="TEACHER">Teacher</MenuItem>
                                  <MenuItem value="ADMIN">Admin</MenuItem>
                                </Select>
                              </FormControl>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => handleRemoveMember(member.userId)}
                                sx={{
                                  borderColor: currentTheme.error,
                                  color: currentTheme.error,
                                  '&:hover': {
                                    borderColor: currentTheme.error,
                                    backgroundColor: currentTheme.error + '10',
                                  },
                                }}
                              >
                                Remove
                              </Button>
                            </Box>
                          </ListItemSecondaryAction>
                        )}
                      </ListItem>
                      {index < classroom.members.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                    Quizzes ({classroom.quizzes.length})
                  </Typography>
                  {isTeacher() && (
                    <Button
                      startIcon={<Add />}
                      onClick={() => setShowAddQuizDialog(true)}
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
                      Add Quiz
                    </Button>
                  )}
                </Box>

                {classroom.quizzes.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Quiz sx={{ fontSize: 64, color: currentTheme.textSecondary, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" gutterBottom sx={{ color: currentTheme.textPrimary }}>
                      No Quizzes Yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                      {isTeacher() ? 'Create the first quiz for this classroom.' : 'No quizzes have been created yet.'}
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                    {classroom.quizzes.map((quiz) => (
                      <Card key={quiz.id} sx={{ backgroundColor: currentTheme.background }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600, mb: 1 }}>
                            {quiz.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
                            {quiz.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                            <Chip label={quiz.category} size="small" />
                            <Chip label={quiz.difficulty} size="small" />
                            <Chip label={`${quiz.questionCount} questions`} size="small" />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                              {new Date(quiz.createdAt).toLocaleDateString()}
                            </Typography>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => navigate(`/quiz/${quiz.id}`)}
                              sx={{
                                backgroundColor: currentTheme.primary,
                                '&:hover': {
                                  backgroundColor: currentTheme.primary,
                                  opacity: 0.9,
                                },
                              }}
                            >
                              Take Quiz
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" sx={{ color: currentTheme.textPrimary, fontWeight: 600, mb: 3 }}>
                  Recent Activities
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <TrendingUp sx={{ fontSize: 64, color: currentTheme.textSecondary, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" gutterBottom sx={{ color: currentTheme.textPrimary }}>
                    No Activities Yet
                  </Typography>
                  <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                    Activity tracking will be available soon.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Invite Member Dialog */}
      <Dialog
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: currentTheme.textPrimary }}>
          Invite Member
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
              Share this join code with the person you want to invite:
            </Typography>
            <TextField
              fullWidth
              value={classroom.joinCode}
              InputProps={{
                readOnly: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: currentTheme.background,
                  fontFamily: 'monospace',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInviteDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassroomDetailsScreen; 