import * as React from 'react';
import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  Link as MuiLink,
  Avatar,
} from '@mui/material';
import {
  MailOutlined as MailIcon,
  LockOutlined as LockIcon,
  Login as LoginIcon,
  VerifiedUser as ShieldIcon,
  KeyboardArrowDown as ChevronDownIcon,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';

const fieldLabelSx = {
  display: 'block',
  fontSize: '0.6875rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  color: '#4A5568',
  textTransform: 'uppercase' as const,
  mb: 0.75,
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#F1F5F4',
    borderRadius: '8px',
    fontSize: '0.9375rem',
    '& fieldset': {
      borderColor: '#E2E8F0',
    },
    '&:hover fieldset': {
      borderColor: '#C8E6D4',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1A6B3C',
      borderWidth: '1px',
    },
  },
  '& .MuiOutlinedInput-input::placeholder': {
    color: '#A0AEC0',
    opacity: 1,
  },
  '& .MuiSelect-select': {
    color: '#718096',
  },
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography component="label" sx={fieldLabelSx}>
      {children}
    </Typography>
  );
}

function BackgroundWatermark() {
  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        top: { xs: -60, md: -40 },
        right: { xs: -100, md: -60 },
        width: { xs: 320, md: 420 },
        height: { xs: 320, md: 420 },
        pointerEvents: 'none',
        opacity: 0.35,
        color: '#C8E6D4',
      }}
    >
      <svg viewBox="0 0 420 420" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <circle cx="210" cy="210" r="200" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="210" cy="210" r="155" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="210" cy="210" r="110" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="210" cy="210" r="65" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="210" cy="210" r="28" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </Box>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const [facilities, setFacilities] = React.useState<{id: number, name: string}[]>([]);
  const [facility, setFacility] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Fetch facilities from backend on mount
  React.useEffect(() => {
    const loadFacilities = async () => {
      try {
        // We cast as any temporarily to allow the transition check
        const data: any = await authService.getFacilities();
        
        // If the API is still returning a legacy array of strings, transform it into objects
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
          setFacilities(data.map((name: string, index: number) => ({ id: index, name })));
        } else {
          setFacilities(data || []);
        }
      } catch (err) {
        console.error('Failed to load facilities:', err);
      }
    };
    loadFacilities();
  }, []);

  const handlePinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 4);
    setPassword(digits);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F4F6F5',
        overflow: 'hidden',
        py: { xs: 6, sm: 8 },
        px: 2,
      }}
    >
      <BackgroundWatermark />

      <Box
        component="main"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Branding */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar
            src="/favicon.ico"
            variant="rounded"
            sx={{
              width: 56,
              height: 56,
              mb: 1.5,
              bgcolor: 'primary.dark',
              borderRadius: '12px',
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.5rem',
              letterSpacing: '-0.02em',
            }}
          >
            RetinaScan
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              color: 'text.secondary',
              textAlign: 'center',
              fontSize: '0.875rem',
              maxWidth: 280,
              lineHeight: 1.5,
            }}
          >
            AI-assisted retinal screening for every facility.
          </Typography>
        </Box>

        {/* Login card */}
        <Paper
          component="form"
          onSubmit={handleSubmit}
          elevation={0}
          sx={{
            width: '100%',
            p: { xs: 2.5, sm: 3 },
            borderRadius: '12px',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
            border: '1px solid #E8EDEA',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <FieldLabel>Facility name</FieldLabel>
              <FormControl fullWidth size="small">
                <Select
                  displayEmpty
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  name="facility"
                  required
                  IconComponent={ChevronDownIcon}
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <Typography component="span" sx={{ color: '#A0AEC0', fontSize: '0.9375rem' }}>
                          Select healthcare facility
                        </Typography>
                      );
                    }
                    return selected;
                  }}
                  sx={{
                    ...inputSx,
                    '& .MuiSelect-select': {
                      py: 1.375,
                      color: facility ? 'text.primary' : '#A0AEC0',
                    },
                    '& .MuiSelect-icon': {
                      color: '#A0AEC0',
                      right: 12,
                    },
                  }}
                >
                  {facilities.map((f) => (
                    <MenuItem key={f.id} value={f.name}>
                      {f.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FieldLabel>Email</FieldLabel>
              <TextField
                fullWidth
                size="small"
                name="email"
                type="email"
                placeholder="Clinical Staff Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                sx={inputSx}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <MailIcon sx={{ fontSize: 20, color: '#A0AEC0' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box>
              <FieldLabel>Secure PIN</FieldLabel>
              <TextField
                fullWidth
                size="small"
                name="pin"
                type="password"
                placeholder="••••"
                value={password}
                onChange={handlePinChange}
                required
                sx={inputSx}
                slotProps={{
                  htmlInput: {
                    maxLength: 4,
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                  },
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <LockIcon sx={{ fontSize: 20, color: '#A0AEC0' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ display: 'block', mt: 0.75, color: '#A0AEC0', fontSize: '0.75rem' }}
              >
                Enter your 4-digit facility-issued PIN
              </Typography>
            </Box>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading}
              endIcon={!isLoading ? <LoginIcon sx={{ fontSize: 20 }} /> : undefined}
              sx={{
                mt: 0.5,
                py: 1.375,
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                backgroundColor: 'primary.main',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  boxShadow: '0 4px 12px rgba(26, 107, 60, 0.25)',
                },
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </Box>
        </Paper>

        {/* Footer links */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            mt: 2.5,
          }}
        >
          <MuiLink
            component={RouterLink}
            to="/forgot-pin"
            underline="none"
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'primary.main',
              textTransform: 'uppercase',
            }}
          >
            Forgot PIN?
          </MuiLink>
          <Typography component="span" sx={{ color: '#CBD5E0', fontSize: '0.5rem' }}>
            •
          </Typography>
          <MuiLink
            component={RouterLink}
            to="/support"
            underline="none"
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: 'primary.main',
              textTransform: 'uppercase',
            }}
          >
            Support hub
          </MuiLink>
        </Box>

        {/* HIPAA compliance */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.5,
            mt: 2.5,
            p: 2,
            width: '100%',
            borderRadius: '10px',
            backgroundColor: '#EDF2F0',
            border: '1px solid #E2E8F0',
          }}
        >
          <ShieldIcon sx={{ fontSize: 22, color: 'primary.main', flexShrink: 0, mt: 0.125 }} />
          <Typography
            variant="caption"
            sx={{
              color: '#718096',
              fontSize: '0.75rem',
              lineHeight: 1.55,
            }}
          >
            This portal is HIPAA compliant. All data transmissions are encrypted using
            medical-grade protocols.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
