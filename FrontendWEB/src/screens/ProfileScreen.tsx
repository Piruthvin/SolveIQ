import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Avatar,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from '@mui/material';
import {
  Person,
  ArrowBack,
  Edit,
  Save,
  Cancel,
  School,
  Work,
  Email,
  Phone,
  LocationOn,
  EmojiEvents,
  Star,
  TrendingUp,
  CalendarToday,
  PhotoCamera,
  Upload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import axios from 'axios';
import { ApiEndpoints } from '../utils/constants';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();
  const { profile, fetchProfile, uploadProfilePicture, getStreakEmoji, getRankColor } = useProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    mobileNumber: '',
    bio: '',
  });

  useEffect(() => {
    console.log('ProfileScreen: useEffect triggered, user ID:', user?.userId);
    if (user?.userId) {
      console.log('ProfileScreen: Calling fetchProfile...');
      fetchProfile();
    }
  }, [user?.userId]);

  useEffect(() => {
    console.log('ProfileScreen: Profile data received:', profile);
    if (profile) {
      console.log('ProfileScreen: Setting form data with profile:', {
        name: profile.name,
        email: profile.email,
        college: profile.college,
        mobileNumber: profile.mobileNumber,
        bio: profile.bio,
        totalQuizzesSolved: profile.totalQuizzesSolved,
        averageScore: profile.averageScore,
        currentStreak: profile.currentStreak,
        daysActive: profile.daysActive,
        rank: profile.rank
      });
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        college: profile.college || '',
        mobileNumber: profile.mobileNumber || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        college: profile.college || '',
        mobileNumber: profile.mobileNumber || '',
        bio: profile.bio || '',
      });
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For now, just close editing mode since updateProfile is not implemented
      setIsEditing(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowUploadDialog(true);
    }
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const success = await uploadProfilePicture(selectedFile);
      if (success) {
        setShowUploadDialog(false);
        setSelectedFile(null);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setIsLoading(false);
    }
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return '#FFD700'; // Gold
    if (streak >= 7) return '#C0C0C0'; // Silver
    if (streak >= 3) return '#CD7F32'; // Bronze
    return currentTheme.primary;
  };

  if (!profile) {
    return (
      <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
            <Person sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              Profile
            </Typography>
          </Box>
          {!isEditing && (
            <Button
              startIcon={<Edit />}
              onClick={handleEdit}
              sx={{
                color: currentTheme.primary,
                '&:hover': {
                  backgroundColor: currentTheme.primary + '10',
                },
              }}
            >
              Edit Profile
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

        {/* Profile Header */}
        <Paper sx={{ mb: 4, backgroundColor: currentTheme.surface }}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ position: 'relative', display: 'inline-block', mb: 3 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton
                    size="small"
                    onClick={() => document.getElementById('profile-picture-input')?.click()}
                    sx={{
                      backgroundColor: currentTheme.primary,
                      color: 'white',
                      '&:hover': {
                        backgroundColor: currentTheme.primary,
                        opacity: 0.9,
                      },
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 16 }} />
                  </IconButton>
                }
              >
                <Avatar
                  src={profile.profilePicture}
                  sx={{
                    width: 120,
                    height: 120,
                    backgroundColor: currentTheme.primary,
                    fontSize: '3rem',
                  }}
                >
                  <Person sx={{ fontSize: 60 }} />
                </Avatar>
              </Badge>
              <input
                id="profile-picture-input"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </Box>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              {profile.name || 'User'}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: currentTheme.textSecondary,
                mb: 3,
              }}
            >
              {profile.email || 'No email'}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<Star />}
                label={`${profile.currentStreak || 0} day streak`}
                sx={{
                  backgroundColor: getStreakColor(profile.currentStreak || 0) + '20',
                  color: getStreakColor(profile.currentStreak || 0),
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<TrendingUp />}
                label={`Rank ${profile.rank || 'N/A'}`}
                sx={{
                  backgroundColor: currentTheme.primary + '20',
                  color: currentTheme.primary,
                  fontWeight: 600,
                }}
              />
              <Chip
                icon={<EmojiEvents />}
                label={`${profile.totalQuizzesSolved || 0} quizzes`}
                sx={{
                  backgroundColor: currentTheme.success + '20',
                  color: currentTheme.success,
                  fontWeight: 600,
                }}
              />
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 4 }}>
          {/* Profile Information */}
          <Paper sx={{ backgroundColor: currentTheme.surface, mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: currentTheme.textPrimary,
                    fontWeight: 600,
                  }}
                >
                  Profile Information
                </Typography>
                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={handleCancel}
                      sx={{
                        color: currentTheme.textSecondary,
                        '&:hover': {
                          backgroundColor: currentTheme.textSecondary + '10',
                        },
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleSave}
                      disabled={isLoading}
                      sx={{
                        backgroundColor: currentTheme.primary,
                        '&:hover': {
                          backgroundColor: currentTheme.primary,
                          opacity: 0.9,
                        },
                      }}
                    >
                      {isLoading ? <CircularProgress size={16} /> : 'Save'}
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="College/University"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="Bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  multiline
                  rows={4}
                  sx={{
                    gridColumn: { xs: '1', sm: '1 / -1' },
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Paper>

          {/* Statistics */}
          <Paper sx={{ backgroundColor: currentTheme.surface, mb: 4 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: currentTheme.textPrimary,
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                Statistics
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmojiEvents sx={{ color: currentTheme.warning }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={profile.averageScore ? Math.round(profile.averageScore) : 0}
                    secondary="Average Score"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp sx={{ color: currentTheme.success }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={profile.totalQuizzesSolved || 0}
                    secondary="Quizzes Completed"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Star sx={{ color: currentTheme.primary }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={profile.currentStreak || 0}
                    secondary="Day Streak"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday sx={{ color: currentTheme.info }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={profile.daysActive || 0}
                    secondary="Days Active"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Paper>
        </Box>
      </Container>

      {/* Upload Picture Dialog */}
      <Dialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: currentTheme.textPrimary }}>
          Upload Profile Picture
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: currentTheme.textSecondary, mb: 2 }}>
            Selected file: {selectedFile?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
            Click upload to set this as your profile picture.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUploadPicture}
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: currentTheme.primary,
              '&:hover': {
                backgroundColor: currentTheme.primary,
                opacity: 0.9,
              },
            }}
          >
            {isLoading ? <CircularProgress size={16} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileScreen; 