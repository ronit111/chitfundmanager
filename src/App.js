import React, { useEffect, useState, useMemo } from 'react';
import { CssBaseline, ThemeProvider, CircularProgress, Box } from '@mui/material';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from './firebase';
import { createAppTheme } from './theme';

// Import modernized UI components
import AuthForm from './components/ui/AuthForm';
import Dashboard from './components/ui/Dashboard';
import GroupDetails from './components/ui/GroupDetails';
import AppLayout from './components/layout/AppLayout';

const auth = getAuth(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [themeMode, setThemeMode] = useState(localStorage.getItem('themeMode') || 'light');
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // Create memoized theme based on the current mode
  const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

  // Toggle between light and dark mode
  const toggleThemeMode = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle group selection
  const handleGroupSelect = (groupId) => {
    // Group selection received
    setSelectedGroupId(groupId);
    // Updated selectedGroupId
  };

  // Handle back navigation from group details
  const handleBackToGroups = () => {
    console.log('Navigating back to dashboard');
    setSelectedGroupId(null);
  };

  // Loading state
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  // Determine the main content based on authentication and navigation state
  let mainContent;
  
  if (!user) {
    // Not logged in: show login/signup form
    mainContent = <AuthForm onAuth={() => setUser(auth.currentUser)} />;
  } else if (selectedGroupId) {
    // Viewing a specific group
    mainContent = (
      <GroupDetails
        groupId={selectedGroupId}
        onBack={handleBackToGroups}
        refreshGroups={() => {}} // This will be implemented when needed
      />
    );
  } else {
    // Showing dashboard
    mainContent = <Dashboard onSelectGroup={handleGroupSelect} />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout 
        user={user} 
        toggleThemeMode={toggleThemeMode} 
        themeMode={themeMode}
        onNavigateToDashboard={handleBackToGroups} // Use the existing back handler to navigate to dashboard
      >
        {mainContent}
      </AppLayout>
    </ThemeProvider>
  );
}
