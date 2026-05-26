import * as React from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Link as MuiLink,
  Container,
  Avatar,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock login redirect
    navigate('/');
  };

  return (
    <Box
      className="min-h-screen flex items-center justify-center bg-gray-50"
      sx={{ py: 12, px: 4 }}
    >
      <Container maxWidth="xs">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Branding Section */}
          <Box className="flex flex-col items-center gap-2 mb-4">
            <Avatar 
              src="/favicon.ico" 
              sx={{ width: 56, height: 56, mb: 1 }} 
              variant="rounded"
            />
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
              RetinaScan
            </Typography>
            <Typography variant="h6" className="text-zinc-900" sx={{ fontWeight: 600 }}>
              Sign in to your account
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            required
            className="bg-white"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            required
            className="bg-white"
          />

          <div className="flex items-center justify-between">
            <FormControlLabel
              control={<Checkbox name="remember" color="primary" />}
              label={<Typography variant="body2">Remember me</Typography>}
            />
            <MuiLink
              component={RouterLink}
              to="/forgot-password"
              variant="body2"
              sx={{ fontWeight: 700, textDecoration: 'none' }}
            >
              Forgot password?
            </MuiLink>
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{ 
              py: 1.5, 
              textTransform: 'none', 
              fontWeight: 700,
              fontSize: '1rem' 
            }}
          >
            Login
          </Button>

          <Typography variant="body2" className="text-center text-zinc-600">
            Don’t have an account?{' '}
            <MuiLink
              component={RouterLink}
              to="/signup"
              sx={{ fontWeight: 700, textDecoration: 'none' }}
            >
              Sign up
            </MuiLink>
          </Typography>
        </form>
      </Container>
    </Box>
  );
}