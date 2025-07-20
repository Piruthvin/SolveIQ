import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  People,
  ArrowBack,
  Search,
  Edit,
  Delete,
  PersonAdd,
  Save,
  Cancel,
  School,
  Email,
  Work,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRoles } from '../utils/constants';
import axios from 'axios';
import { ApiEndpoints } from '../utils/constants';

interface User {
  userId: string;
  name: string;
  email: string;
  role: string;
  college?: string;
  mobileNumber?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const ManageUsersScreen: React.FC = () => {
  const navigate = useNavigate();
  const { currentTheme } = useTheme();
  const { user, token } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    college: '',
    mobileNumber: '',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    if (!token) {
      setError('No authentication token found');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${ApiEndpoints.admin}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(response.data);
    } catch (error: any) {
      if (error.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      college: user.college || '',
      mobileNumber: user.mobileNumber || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.put(`${ApiEndpoints.admin}/users/${editingUser.userId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(prev => prev.map(user => 
        user.userId === editingUser.userId ? { ...user, ...editForm } : user
      ));

      setShowEditDialog(false);
      setEditingUser(null);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!token || !window.confirm('Are you sure you want to delete this user?')) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${ApiEndpoints.admin}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(prev => prev.filter(user => user.userId !== userId));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      await axios.patch(`${ApiEndpoints.admin}/users/${userId}/toggle-status`, {
        isActive: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(prev => prev.map(user => 
        user.userId === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setIsLoading(false);
    }
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

  if (!user || user.role !== 'ADMIN') {
    return (
      <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: currentTheme.surface }}>
          <People sx={{ fontSize: 64, color: currentTheme.error, mb: 2 }} />
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
            <People sx={{ color: currentTheme.primary, mr: 1 }} />
            <Typography
              variant="h6"
              sx={{
                color: currentTheme.textPrimary,
                fontWeight: 700,
              }}
            >
              Manage Users
            </Typography>
          </Box>
          <Button
            startIcon={<PersonAdd />}
            onClick={() => navigate('/add-user')}
            sx={{
              color: currentTheme.primary,
              '&:hover': {
                backgroundColor: currentTheme.primary + '10',
              },
            }}
          >
            Add User
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Search Bar */}
        <Paper sx={{ mb: 3, backgroundColor: currentTheme.surface }}>
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Search users by name, email, or role..."
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
                '& .MuiOutlinedInput-root': {
                  backgroundColor: currentTheme.background,
                },
              }}
            />
          </Box>
        </Paper>

        {/* Users Table */}
        <Paper sx={{ backgroundColor: currentTheme.surface }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: currentTheme.background }}>
                    <TableCell sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                      User
                    </TableCell>
                    <TableCell sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                      College
                    </TableCell>
                    <TableCell sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                      Joined
                    </TableCell>
                    <TableCell sx={{ color: currentTheme.textPrimary, fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.userId}
                      sx={{
                        '&:hover': {
                          backgroundColor: currentTheme.background,
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              backgroundColor: currentTheme.primary,
                              width: 40,
                              height: 40,
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ color: currentTheme.textPrimary, fontWeight: 500 }}>
                              {user.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          sx={{
                            backgroundColor: getRoleColor(user.role) + '20',
                            color: getRoleColor(user.role),
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                          {user.college || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={user.isActive ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: currentTheme.textSecondary }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            startIcon={<Edit />}
                            onClick={() => handleEditUser(user)}
                            sx={{
                              color: currentTheme.primary,
                              '&:hover': {
                                backgroundColor: currentTheme.primary + '10',
                              },
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleToggleUserStatus(user.userId, user.isActive)}
                            sx={{
                              borderColor: user.isActive ? currentTheme.error : currentTheme.success,
                              color: user.isActive ? currentTheme.error : currentTheme.success,
                              '&:hover': {
                                borderColor: user.isActive ? currentTheme.error : currentTheme.success,
                                backgroundColor: (user.isActive ? currentTheme.error : currentTheme.success) + '10',
                              },
                            }}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => handleDeleteUser(user.userId)}
                            sx={{
                              borderColor: currentTheme.error,
                              color: currentTheme.error,
                              '&:hover': {
                                borderColor: currentTheme.error,
                                backgroundColor: currentTheme.error + '10',
                              },
                            }}
                          >
                            Delete
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>

      {/* Edit User Dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: currentTheme.textPrimary }}>
          Edit User
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: currentTheme.background,
                },
              }}
            />
            <TextField
              fullWidth
              label="Email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: currentTheme.background,
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
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
              label="College"
              value={editForm.college}
              onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: currentTheme.background,
                },
              }}
            />
            <TextField
              fullWidth
              label="Mobile Number"
              value={editForm.mobileNumber}
              onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: currentTheme.background,
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateUser}
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
            {isLoading ? <CircularProgress size={16} /> : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsersScreen; 