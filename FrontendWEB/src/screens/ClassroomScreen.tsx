import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  AppBar,
  Toolbar,
  Fab,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  School,
  Add,
  Group,
  Person,
  ArrowBack,
  Edit,
  Delete,
  Login,
  ExitToApp,
  Assignment,
  Quiz,
  Chat,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { ApiEndpoints } from '../utils/constants';

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
}

interface ClassroomMember {
  userId: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  joinedAt: string;
}

const ClassroomScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();
  
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [myClassrooms, setMyClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  
  // Create classroom form
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    category: '',
    maxMembers: 30,
    isPrivate: false,
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    console.log('ClassroomScreen: Starting to fetch classrooms...');
    console.log('ClassroomScreen: Token:', token ? 'Present' : 'Missing');
    console.log('ClassroomScreen: User ID:', user?.userId);
    console.log('ClassroomScreen: User role:', user?.role);
    
    if (!user?.userId) {
      setError('User not found. Please login again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('ClassroomScreen: Making API calls...');
      
      let myClassroomsRes;
      let allClassroomsRes;
      
      // Fetch classrooms based on user role
      if (user.role === 'TEACHER' || user.role === 'ADMIN') {
        myClassroomsRes = await axios.get(`${ApiEndpoints.classroom}/teacher/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // For teachers, show their classrooms as available classrooms too
        allClassroomsRes = myClassroomsRes;
      } else {
        // For students, fetch their enrolled classrooms
        myClassroomsRes = await axios.get(`${ApiEndpoints.classroom}/student/${user.userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // For now, show the same classrooms as available (can be modified later)
        allClassroomsRes = myClassroomsRes;
      }

      console.log('ClassroomScreen: API responses received:', {
        myClassrooms: myClassroomsRes.data,
        allClassrooms: allClassroomsRes.data
      });

      setMyClassrooms(myClassroomsRes.data || []);
      setClassrooms(allClassroomsRes.data || []);
    } catch (error: any) {
      console.error('ClassroomScreen: Error fetching classrooms:', error);
      console.error('ClassroomScreen: Error response:', error.response);
      console.error('ClassroomScreen: Error message:', error.message);
      
      if (error.response?.status === 404) {
        setError('Classroom API endpoint not found. Please check if the backend is running.');
      } else if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        setError('Access denied. You do not have permission to view classrooms.');
      } else if (error.code === 'ERR_NETWORK') {
        setError('Network error. Please check if the backend server is running on http://localhost:8800');
      } else {
        setError(error.response?.data?.message || `Failed to fetch classrooms: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClassroom = async () => {
    if (!createForm.name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${ApiEndpoints.classroom}/create`,
        {
          name: createForm.name,
          description: createForm.description,
          category: createForm.category,
          maxMembers: createForm.maxMembers,
          isPrivate: createForm.isPrivate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMyClassrooms([...myClassrooms, response.data]);
      setShowCreateDialog(false);
      setCreateForm({
        name: '',
        description: '',
        category: '',
        maxMembers: 30,
        isPrivate: false,
      });
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create classroom');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClassroom = async () => {
    if (!joinCode.trim() || !user?.userId) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.post(
        `${ApiEndpoints.classroom}/join?joinLink=${encodeURIComponent(joinCode.trim())}&studentId=${user.userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setShowJoinDialog(false);
      setJoinCode('');
      fetchClassrooms(); // Refresh to show updated data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to join classroom');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveClassroom = async (classroomId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.post(
        `${ApiEndpoints.classroom}/${classroomId}/leave`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      fetchClassrooms(); // Refresh to show updated data
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to leave classroom');
    } finally {
      setIsLoading(false);
    }
  };

  const isMember = (classroom: Classroom) => {
    return classroom.members?.some(member => member.userId === user?.userId) || false;
  };

  const getMemberRole = (classroom: Classroom) => {
    const member = classroom.members?.find(m => m.userId === user?.userId);
    return member?.role || 'Unknown';
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
            <School sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              Classrooms
            </Typography>
          </Box>
          <Button
            startIcon={<Add />}
            onClick={() => setShowCreateDialog(true)}
            variant="contained"
            sx={{
              backgroundColor: currentTheme.primary,
              '&:hover': {
                backgroundColor: currentTheme.primary,
                opacity: 0.9,
              },
            }}
          >
            Create Classroom
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* My Classrooms */}
        <Box mb={4}>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              color: currentTheme.textPrimary,
              fontWeight: 600,
              mb: 3,
            }}
          >
            My Classrooms
          </Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : myClassrooms.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                backgroundColor: currentTheme.surface,
              }}
            >
              <School sx={{ fontSize: 64, color: currentTheme.textSecondary, mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ color: currentTheme.textPrimary }}>
                No Classrooms Yet
              </Typography>
              <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 3 }}>
                Create your first classroom or join an existing one to get started.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowCreateDialog(true)}
                  sx={{
                    backgroundColor: currentTheme.primary,
                    '&:hover': {
                      backgroundColor: currentTheme.primary,
                      opacity: 0.9,
                    },
                  }}
                >
                  Create Classroom
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Login />}
                  onClick={() => setShowJoinDialog(true)}
                  sx={{
                    borderColor: currentTheme.primary,
                    color: currentTheme.primary,
                    '&:hover': {
                      borderColor: currentTheme.primary,
                      backgroundColor: currentTheme.primary + '10',
                    },
                  }}
                >
                  Join Classroom
                </Button>
              </Box>
            </Paper>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {myClassrooms.map((classroom) => (
                <Card
                  key={classroom.id}
                  sx={{
                    height: '100%',
                    backgroundColor: currentTheme.surface,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          backgroundColor: currentTheme.primary,
                          mr: 2,
                        }}
                      >
                        <School />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{
                            color: currentTheme.textPrimary,
                            fontWeight: 600,
                          }}
                        >
                          {classroom.name}
                        </Typography>
                        <Chip
                          label={getMemberRole(classroom)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                    
                    <Typography
                      variant="body2"
                      sx={{
                        color: currentTheme.textSecondary,
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {classroom.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Group sx={{ fontSize: 16, mr: 1, color: currentTheme.textSecondary }} />
                      <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                        {classroom.members?.length || 0}/{classroom.maxMembers} members
                      </Typography>
                    </Box>
                    
                    <Chip
                      label={classroom.category}
                      size="small"
                      sx={{
                        backgroundColor: currentTheme.primary + '20',
                        color: currentTheme.primary,
                      }}
                    />
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <Button
                      size="small"
                      onClick={() => navigate(`/classroom/${classroom.id}`)}
                      sx={{
                        color: currentTheme.primary,
                        '&:hover': {
                          backgroundColor: currentTheme.primary + '10',
                        },
                      }}
                    >
                      View Details
                    </Button>
                    
                    {getMemberRole(classroom) !== 'ADMIN' && (
                      <Button
                        size="small"
                        startIcon={<ExitToApp />}
                        onClick={() => handleLeaveClassroom(classroom.id)}
                        sx={{
                          color: currentTheme.error,
                          '&:hover': {
                            backgroundColor: currentTheme.error + '10',
                          },
                        }}
                      >
                        Leave
                      </Button>
                    )}
                  </CardActions>
                </Card>
              ))}
            </Box>
          )}
        </Box>

        {/* Available Classrooms */}
        <Box>
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              color: currentTheme.textPrimary,
              fontWeight: 600,
              mb: 3,
            }}
          >
            Available Classrooms
          </Typography>
          
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
              {classrooms && classrooms.length > 0 ? (
                classrooms
                  .filter(classroom => !isMember(classroom))
                  .map((classroom) => (
                  <Card
                    key={classroom.id}
                    sx={{
                      height: '100%',
                      backgroundColor: currentTheme.surface,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar
                          sx={{
                            backgroundColor: currentTheme.secondary,
                            mr: 2,
                          }}
                        >
                          <Person />
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                              color: currentTheme.textPrimary,
                              fontWeight: 600,
                            }}
                          >
                            {classroom.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                            by {classroom.creatorName}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography
                        variant="body2"
                        sx={{
                          color: currentTheme.textSecondary,
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {classroom.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Group sx={{ fontSize: 16, mr: 1, color: currentTheme.textSecondary }} />
                        <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                          {classroom.members?.length || 0}/{classroom.maxMembers} members
                        </Typography>
                      </Box>
                      
                      <Chip
                        label={classroom.category}
                        size="small"
                        sx={{
                          backgroundColor: currentTheme.secondary + '20',
                          color: currentTheme.secondary,
                        }}
                      />
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'center', px: 2, pb: 2 }}>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<Login />}
                        onClick={() => {
                          setJoinCode(classroom.id);
                          setShowJoinDialog(true);
                        }}
                        sx={{
                          backgroundColor: currentTheme.secondary,
                          '&:hover': {
                            backgroundColor: currentTheme.secondary,
                            opacity: 0.9,
                          },
                        }}
                      >
                        Join Classroom
                      </Button>
                    </CardActions>
                  </Card>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" sx={{ color: currentTheme.textSecondary }}>
                    No classrooms available to join
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Container>

      {/* Create Classroom Dialog */}
      <Dialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: currentTheme.textPrimary }}>
          Create New Classroom
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Classroom Name"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={createForm.description}
            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Category"
            value={createForm.category}
            onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Max Members"
            type="number"
            value={createForm.maxMembers}
            onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) })}
            margin="normal"
            inputProps={{ min: 1, max: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateClassroom}
            variant="contained"
            disabled={!createForm.name.trim() || isLoading}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Join Classroom Dialog */}
      <Dialog
        open={showJoinDialog}
        onClose={() => setShowJoinDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: currentTheme.textPrimary }}>
          Join Classroom
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Classroom Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            margin="normal"
            required
            placeholder="Enter classroom code or ID"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJoinDialog(false)}>Cancel</Button>
          <Button
            onClick={handleJoinClassroom}
            variant="contained"
            disabled={!joinCode.trim() || isLoading}
          >
            Join
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassroomScreen; 