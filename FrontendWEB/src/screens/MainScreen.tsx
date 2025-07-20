import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  Home,
  Quiz,
  Leaderboard,
  Person,
  AdminPanelSettings,
  AccountCircle,
  Logout,
  Settings,
  NotificationsOutlined,
  Search,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useProfile } from '../contexts/ProfileContext';
import HomeScreen from './HomeScreen';
import QuizPlayScreen from './QuizPlayScreen';
import LeaderboardScreen from './LeaderboardScreen';
import ProfileScreen from './ProfileScreen';
import AdminScreen from './AdminScreen';

const MainScreen: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentTheme, toggleTheme } = useTheme();
  const { profile } = useProfile();
  const [selectedTab, setSelectedTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const isAdmin = user?.role === 'ADMIN';

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getScreens = () => {
    const screens = [
      <HomeScreen key="home" />,
      <QuizPlayScreen key="quiz" />,
      <LeaderboardScreen key="leaderboard" />,
      <ProfileScreen key="profile" />,
    ];
    
    if (isAdmin) {
      screens.push(<AdminScreen key="admin" />);
    }
    
    return screens;
  };

  const getNavigationItems = () => {
    const items = [
      { label: 'Home', icon: <Home />, value: 0 },
      { label: 'Quiz', icon: <Quiz />, value: 1 },
      { label: 'Leaderboard', icon: <Leaderboard />, value: 2 },
      { label: 'Profile', icon: <Person />, value: 3 },
    ];
    
    if (isAdmin) {
      items.push({ label: 'Admin', icon: <AdminPanelSettings />, value: 4 });
    }
    
    return items;
  };

  const screens = getScreens();
  const navigationItems = getNavigationItems();

  return (
    <Box sx={{ backgroundColor: currentTheme.background, minHeight: '100vh', pb: 7 }}>
      {/* Top App Bar */}
      <AppBar
        position="static"
        sx={{
          backgroundColor: currentTheme.surface,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              color: currentTheme.textPrimary,
              fontWeight: 700,
            }}
          >
            SolveIQ
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${profile?.streak || 0} day streak`}
              color="primary"
              size="small"
            />
            <IconButton
              onClick={() => navigate('/search-profile')}
              sx={{ color: currentTheme.textPrimary }}
            >
              <Search />
            </IconButton>
            <IconButton
              onClick={() => {/* Notifications feature coming soon */}}
              sx={{ color: currentTheme.textPrimary }}
            >
              <NotificationsOutlined />
            </IconButton>
            <IconButton
              onClick={handleMenuOpen}
              sx={{ color: currentTheme.textPrimary }}
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            backgroundColor: currentTheme.surface,
            color: currentTheme.textPrimary,
          },
        }}
      >
        <MenuItem onClick={() => { handleMenuClose(); setSelectedTab(3); }}>
          <Person sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={toggleTheme}>
          <Settings sx={{ mr: 1 }} />
          Toggle Theme
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        {screens[selectedTab]}
      </Box>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: currentTheme.surface,
          borderTop: `1px solid ${currentTheme.textSecondary}20`,
        }}
        elevation={3}
      >
        <BottomNavigation
          value={selectedTab}
          onChange={(event, newValue) => {
            setSelectedTab(newValue);
          }}
          sx={{
            backgroundColor: currentTheme.surface,
            '& .MuiBottomNavigationAction-root': {
              color: currentTheme.textSecondary,
              '&.Mui-selected': {
                color: currentTheme.primary,
              },
            },
          }}
        >
          {navigationItems.map((item) => (
            <BottomNavigationAction
              key={item.value}
              label={item.label}
              icon={item.icon}
              value={item.value}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MainScreen; 