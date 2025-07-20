import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Alert,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Link,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  School,
  Phone,
  Work,
  ArrowBack,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ApiEndpoints } from '../utils/constants';
import axios from 'axios';

const SignupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    mobileNumber: '',
    role: 'STUDENT',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Please enter your name';
    }

    if (!formData.email.trim()) {
      errors.email = 'Please enter your email';
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Please enter your password';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.college.trim()) {
      errors.college = 'Please enter your college name';
    }

    if (!formData.mobileNumber.trim()) {
      errors.mobileNumber = 'Please enter your mobile number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log('SignupScreen: Registering user...');
      const response = await axios.post(`${ApiEndpoints.auth}/register`, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        college: formData.college.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        role: formData.role,
      });

      console.log('SignupScreen: Registration response:', response.data);

      if (response.data.token) {
        // Auto-login after successful registration
        await login(formData.email.trim(), formData.password);
        navigate('/');
      } else {
        setError('Registration successful but login failed. Please try logging in.');
      }
    } catch (error: any) {
      console.error('SignupScreen: Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
            Create Account
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card
          sx={{
            backgroundColor: currentTheme.surface,
            border: `1px solid ${currentTheme.textSecondary}10`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                              <Typography
                  variant="h4"
                  sx={{
                    color: currentTheme.textPrimary,
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  Join SolveIQ
                </Typography>
              <Typography
                variant="body1"
                sx={{ color: currentTheme.textSecondary }}
              >
                Start your learning journey today
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Name Field */}
              <TextField
                fullWidth
                label="Name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person sx={{ color: currentTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: currentTheme.background,
                    '& fieldset': {
                      borderColor: currentTheme.textSecondary + '30',
                    },
                    '&:hover fieldset': {
                      borderColor: currentTheme.primary + '50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: currentTheme.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: currentTheme.textSecondary,
                  },
                  '& .MuiInputBase-input': {
                    color: currentTheme.textPrimary,
                  },
                }}
              />

              {/* Email Field */}
              <TextField
                fullWidth
                label="Email"
                placeholder="Enter your email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: currentTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: currentTheme.background,
                    '& fieldset': {
                      borderColor: currentTheme.textSecondary + '30',
                    },
                    '&:hover fieldset': {
                      borderColor: currentTheme.primary + '50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: currentTheme.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: currentTheme.textSecondary,
                  },
                  '& .MuiInputBase-input': {
                    color: currentTheme.textPrimary,
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!formErrors.password}
                helperText={formErrors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: currentTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ color: currentTheme.textSecondary }} />
                        ) : (
                          <Visibility sx={{ color: currentTheme.textSecondary }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: currentTheme.background,
                    '& fieldset': {
                      borderColor: currentTheme.textSecondary + '30',
                    },
                    '&:hover fieldset': {
                      borderColor: currentTheme.primary + '50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: currentTheme.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: currentTheme.textSecondary,
                  },
                  '& .MuiInputBase-input': {
                    color: currentTheme.textPrimary,
                  },
                }}
              />

              {/* College Field */}
              <TextField
                fullWidth
                label="College"
                placeholder="Enter your college name"
                value={formData.college}
                onChange={(e) => handleInputChange('college', e.target.value)}
                error={!!formErrors.college}
                helperText={formErrors.college}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School sx={{ color: currentTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: currentTheme.background,
                    '& fieldset': {
                      borderColor: currentTheme.textSecondary + '30',
                    },
                    '&:hover fieldset': {
                      borderColor: currentTheme.primary + '50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: currentTheme.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: currentTheme.textSecondary,
                  },
                  '& .MuiInputBase-input': {
                    color: currentTheme.textPrimary,
                  },
                }}
              />

              {/* Mobile Number Field */}
              <TextField
                fullWidth
                label="Mobile Number"
                placeholder="Enter your mobile number"
                type="tel"
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                error={!!formErrors.mobileNumber}
                helperText={formErrors.mobileNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: currentTheme.textSecondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: currentTheme.background,
                    '& fieldset': {
                      borderColor: currentTheme.textSecondary + '30',
                    },
                    '&:hover fieldset': {
                      borderColor: currentTheme.primary + '50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: currentTheme.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: currentTheme.textSecondary,
                  },
                  '& .MuiInputBase-input': {
                    color: currentTheme.textPrimary,
                  },
                }}
              />

              {/* Role Selection */}
              <FormControl fullWidth>
                <InputLabel sx={{ color: currentTheme.textSecondary }}>
                  Role
                </InputLabel>
                <Select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  sx={{
                    backgroundColor: currentTheme.background,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: currentTheme.textSecondary + '30',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: currentTheme.primary + '50',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: currentTheme.primary,
                    },
                    '& .MuiSelect-select': {
                      color: currentTheme.textPrimary,
                    },
                  }}
                >
                  <MenuItem value="STUDENT">Student</MenuItem>
                  <MenuItem value="TEACHER">Teacher</MenuItem>
                </Select>
              </FormControl>

              {/* Signup Button */}
              <Button
                fullWidth
                variant="contained"
                onClick={handleSignup}
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  mt: 2,
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
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Login Link */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography
                  variant="body2"
                  sx={{ color: currentTheme.textSecondary }}
                >
                  Already have an account?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/login')}
                    sx={{
                      color: currentTheme.primary,
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SignupScreen; 