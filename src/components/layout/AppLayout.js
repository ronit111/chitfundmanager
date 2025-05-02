// src/components/layout/AppLayout.js
// Mobile-optimized layout component that provides the application structure

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  CssBaseline, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Switch,
  FormControlLabel,
  Container,
  useTheme,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  AccountCircle,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { getAuth, signOut } from 'firebase/auth';

// Layout component that wraps the entire application
const AppLayout = ({ children, user, toggleThemeMode, themeMode, onNavigateToDashboard }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const auth = getAuth();

  // Always start with drawer closed on mobile for better UX
  useEffect(() => {
    // Always close drawer on mobile for better initial experience
    setDrawerOpen(false);
  }, [isMobile]);

  // Handle user menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle user menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle logout
  const handleLogout = () => {
    handleMenuClose();
    signOut(auth);
  };

  // Toggle drawer open/closed
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // Drawer content
  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          pt: 4
        }}
      >
        <Avatar
          sx={{
            width: 64,
            height: 64,
            mb: 2,
            bgcolor: theme.palette.primary.main
          }}
        >
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Typography variant="h6" noWrap component="div" sx={{ mb: 0.5 }}>
          {user?.email?.split('@')[0] || 'User'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {user?.email || ''}
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={() => {
            // Close drawer on mobile after navigation
            if (isMobile) setDrawerOpen(false);
            // Navigate to dashboard - force navigation to dashboard by setting selectedGroupId to null
            if (onNavigateToDashboard) {
              onNavigateToDashboard();
              // Add console log to debug
              console.log('Dashboard button clicked, navigating to dashboard');
            }
          }}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={themeMode === 'dark'}
              onChange={toggleThemeMode}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {themeMode === 'dark' ? <DarkModeIcon sx={{ mr: 1 }} /> : <LightModeIcon sx={{ mr: 1 }} />}
              {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Box>
          }
        />
      </Box>
    </>
  );

  // If user is not logged in, don't show the layout
  if (!user) {
    return (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          boxShadow: 3,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #303f9f 30%, #5c6bc0 90%)'
            : 'linear-gradient(45deg, #3f51b5 30%, #757de8 90%)',
          height: { xs: '56px', sm: '64px' }, // Lower height on mobile for more content space
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Chit Fund Manager
          </Typography>
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Logout</ListItemText>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          width: { xs: '85%', sm: 240 }, // Wider drawer on small mobile screens
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: { xs: '85%', sm: 240 },
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        {drawerContent}
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 }, // Less padding on mobile for more content space
          width: '100%', // Always use full width on mobile
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar />
        <Container 
          disableGutters={isMobile} // Remove container padding on mobile
          maxWidth="lg" 
          sx={{ 
            mt: { xs: 1, sm: 2 }, // Less margin on mobile
          }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
