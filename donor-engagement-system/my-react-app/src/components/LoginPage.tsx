// LoginPage.tsx
import * as React from 'react';
import { useState } from 'react';
import { 
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  ThemeProvider
} from '@mui/material';
import useLogin from '../hooks/useLogin.ts';
import { theme } from '../theme/theme.ts';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const { handleLogin, loading, error } = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const onLogin = () => {
    handleLogin(username, password);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ position: 'absolute', right: 40 }}>
        <Box sx={{ textAlign: 'left', lineHeight: 1, mt: '5rem', ml: '6rem' }}>
          <h1 className="no-space">BC</h1>
          <h1 className="no-space">CANCER</h1>
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: '30%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            padding: '2rem',
          }}
        >

          <Box textAlign="center" mb={2}>
            <img
              src="/BCCF-color-logo.png"
              alt="BC Cancer"
              style={{
                width: '100%',
                maxWidth: '300px',
                height: 'auto',
                marginBottom: '5rem',
            }}
          />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Welcome!
            </Typography>
            <Typography variant="body2">
              Sign in to continue.
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              width: '60%',
              mx: 'auto',
              my: '1.5rem',
              py: '0.75rem',
              px: '0.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              borderRadius: '0.25rem',
              bgcolor: 'transparent',
            }}
          >
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Username"
                name="username"
                variant="outlined"
                fullWidth
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                size="small"
              />

            <TextField
              label="Password"
              name="password"
              type="password"
              variant="outlined"
              fullWidth
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="small"
            />
          </Box>
          
          {error && (
            <Typography 
              color="error" 
              variant="body2" 
              sx={{ mt: 1 }}
            >
              {error}
            </Typography>
          )}
          
          <Button
            onClick={onLogin}
            disabled={loading}
            sx={{
              mt: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
            }}
            variant="contained"
            fullWidth
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default LoginPage;