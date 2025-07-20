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
} from '@mui/material';
import {
  PersonAdd,
  ArrowBack,
  Save,
  School,
  Email,
  Phone,
  Work,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRoles } from '../utils/constants';
import axios from 'axios';
import { ApiEndpoints } from '../utils/constants';

const AddUserScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    college: '',
    mobileNumber: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('No authentication token found');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(`${ApiEndpoints.admin}/users`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        college: formData.college,
        mobileNumber: formData.mobileNumber,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess('User created successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT',
        college: '',
        mobileNumber: '',
      });
    } catch (error: any) {
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(error.response?.data?.message || 'Failed to create user');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: currentTheme.surface }}>
          <PersonAdd sx={{ fontSize: 64, color: currentTheme.error, mb: 2 }} />
          <Typography variant="h5" gutterBottom sx={{ color: currentTheme.textPrimary }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ color: currentTheme.textSecondary, mb: 3 }}>
            You need admin privileges to access this page.
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
            <PersonAdd sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              Add User
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Paper sx={{ backgroundColor: currentTheme.surface }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h5"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 600,
                mb: 3,
              }}
            >
              Create New User
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    sx={{
                      backgroundColor: currentTheme.background,
                    }}
                  >
                    {Object.entries(UserRoles).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="College/University"
                  value={formData.college}
                  onChange={(e) => handleInputChange('college', e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: currentTheme.background,
                    },
                  }}
                />
              </Box>

              <TextField
                fullWidth
                label="Mobile Number"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: currentTheme.background,
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  sx={{
                    borderColor: currentTheme.textSecondary,
                    color: currentTheme.textSecondary,
                    '&:hover': {
                      borderColor: currentTheme.textSecondary,
                      backgroundColor: currentTheme.textSecondary + '10',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={16} /> : <Save />}
                  sx={{
                    backgroundColor: currentTheme.primary,
                    '&:hover': {
                      backgroundColor: currentTheme.primary,
                      opacity: 0.9,
                    },
                  }}
                >
                  {isLoading ? 'Creating...' : 'Create User'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Paper>
      </Container>
    </Box>
  );
};

export default AddUserScreen; 