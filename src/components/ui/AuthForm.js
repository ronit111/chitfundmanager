// src/components/ui/AuthForm.js
// Mobile-optimized, accessible authentication form with improved UI/UX

import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  InputAdornment, 
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  CircularProgress
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Login as LoginIcon, 
  PersonAdd as SignupIcon 
} from '@mui/icons-material';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '../../firebase';

const auth = getAuth(app);

/**
 * Enhanced AuthForm Component
 * Features:
 * - Responsive design for all screen sizes
 * - Password visibility toggle
 * - Accessible form controls with proper ARIA attributes
 * - Visual feedback for form states (loading, error)
 * - Smooth animations for transitions
 */
export default function AuthForm({ onAuth }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Theme and isMobile are already defined above

  // Toggle password visibility
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handles login or signup with loading state and error handling
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuth(); // Notify parent on successful auth
    } catch (err) {
      // Provide user-friendly error messages
      let errorMessage = 'Authentication failed. Please try again.';
      
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email or login.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format. Please enter a valid email address.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: { xs: 1.5, sm: 2 }, // Less padding on mobile
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(45deg, #303f9f 30%, #1a237e 90%)'
          : 'linear-gradient(45deg, #e8eaf6 30%, #c5cae9 90%)',
      }}
    >
      <Fade in={true} timeout={800}>
        <Card 
          elevation={8}
          sx={{
            maxWidth: 450,
            width: '100%',
            borderRadius: { xs: 2, sm: 3 }, // Smaller radius on mobile
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Paper
            sx={{
              p: { xs: 2, sm: 3 }, // Less padding on mobile
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(45deg, #3949ab 30%, #5c6bc0 90%)'
                : 'linear-gradient(45deg, #3f51b5 30%, #7986cb 90%)',
              color: 'white',
              borderRadius: 0,
            }}
          >
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              component="h1" 
              align="center" 
              sx={{ fontWeight: 'bold' }}
            >
              {isSignup ? 'Create Account' : 'Welcome Back'}
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              sx={{ mt: 1, opacity: 0.9 }}
            >
              {isSignup 
                ? 'Sign up to manage your chit funds' 
                : 'Sign in to access your chit funds'}
            </Typography>
          </Paper>
          
          <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2 }}
                variant="filled"
              >
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} noValidate>
              <TextField
                label="Email Address"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
                InputProps={{
                  'aria-label': 'Email Address',
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                InputProps={{
                  'aria-label': 'Password',
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size={isMobile ? "medium" : "large"}
                disabled={loading}
                startIcon={isSignup ? <SignupIcon /> : <LoginIcon />}
                sx={{ 
                  py: { xs: 1, sm: 1.5 },
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 10px rgba(0, 0, 0, 0.2)',
                  },
                  '&:active': { // Better for touch devices
                    transform: 'scale(0.98)',
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isSignup ? 'Sign Up' : 'Sign In'
                )}
              </Button>
            </form>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                onClick={() => setIsSignup(!isSignup)}
                color="secondary"
                sx={{ textTransform: 'none' }}
              >
                {isSignup 
                  ? 'Already have an account? Sign In' 
                  : "Don't have an account? Sign Up"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Box>
  );
}
