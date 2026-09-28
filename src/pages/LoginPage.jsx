import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Alert,
  AlertTitle,
  Chip,
  Stack,
  SvgIcon,
} from '@mui/material';

// Material-styled SVG Icons using MUI's SvgIcon
const HardwareIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </SvgIcon>
);

const EmailIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill="none" stroke="currentColor" strokeWidth="2" />
    <polyline points="22,6 12,13 2,6" fill="none" stroke="currentColor" strokeWidth="2" />
  </SvgIcon>
);

const LockIcon = (props) => (
  <SvgIcon {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="2" />
  </SvgIcon>
);

const VisibilityIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
  </SvgIcon>
);

const VisibilityOffIcon = (props) => (
  <SvgIcon {...props}>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
  </SvgIcon>
);

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Validation & Error States
  const [clientErrors, setClientErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [errorDetails, setErrorDetails] = useState(null);

  const validateForm = () => {
    const errors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setErrorDetails(null);

    if (!validateForm()) {
      return;
    }

    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      if (err.isNetworkError) {
        setServerError('Cannot connect to backend server. Please verify backend is running on port 3000.');
      } else {
        setServerError(err.message || 'Login failed. Please check your credentials.');
        if (err.statusCode) {
          setErrorDetails(`HTTP ${err.statusCode}`);
        }
      }
    }
  };

  const handleQuickFill = (testEmail, testPassword) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setClientErrors({});
    setServerError('');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
        backgroundImage: `
          radial-gradient(circle at 10% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 40%)
        `,
        p: 2,
      }}
    >
      <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3.5, sm: 4.5 },
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* TITANCORE & B2B HARDWARE TRACKER Branding */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                color: '#0b0f19',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.3)',
                mb: 1.5,
              }}
            >
              <HardwareIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'text.primary' }}>
              TITAN<Box component="span" sx={{ color: 'primary.main' }}>CORE</Box>
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: '0.08em', fontWeight: 600, display: 'block', mt: 0.5 }}>
              B2B HARDWARE TRACKER
            </Typography>
          </Box>

          {/* Backend Error Alert */}
          {serverError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                backgroundColor: 'rgba(244, 63, 94, 0.12)',
                border: '1px solid rgba(244, 63, 94, 0.35)',
                color: '#fb7185',
                '& .MuiAlert-icon': { color: '#fb7185' },
              }}
            >
              <AlertTitle sx={{ fontSize: '0.88rem', fontWeight: 700, mb: errorDetails ? 0.5 : 0 }}>
                {serverError}
              </AlertTitle>
              {errorDetails && (
                <Typography variant="caption" sx={{ fontFamily: 'monospace', opacity: 0.85 }}>
                  {errorDetails}
                </Typography>
              )}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <TextField
                id="email"
                label="Work Email"
                name="email"
                type="email"
                autoComplete="email"
                fullWidth
                variant="outlined"
                size="medium"
                value={email}
                disabled={isLoading}
                error={Boolean(clientErrors.email)}
                helperText={clientErrors.email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (clientErrors.email) setClientErrors({ ...clientErrors, email: null });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                id="password"
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                fullWidth
                variant="outlined"
                size="medium"
                value={password}
                disabled={isLoading}
                error={Boolean(clientErrors.password)}
                helperText={clientErrors.password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (clientErrors.password) setClientErrors({ ...clientErrors, password: null });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                id="login-submit-btn"
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 1,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                }}
              >
                {isLoading ? (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={18} sx={{ color: '#0b0f19' }} />
                    <span>Authenticating...</span>
                  </Stack>
                ) : (
                  'Sign In to Terminal'
                )}
              </Button>
            </Stack>
          </Box>

          {/* Quick Demo Autofill Helper */}
          <Box
            sx={{
              mt: 3,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed rgba(255, 255, 255, 0.1)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1, fontWeight: 600 }}>
              SEEDED CREDENTIALS:
            </Typography>
            <Chip
              label="admin@company.com / password"
              size="small"
              onClick={() => handleQuickFill('admin@company.com', 'password')}
              disabled={isLoading}
              clickable
              sx={{
                fontFamily: 'monospace',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: 'primary.light',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(245, 158, 11, 0.25)',
                },
              }}
            />
          </Box>

          {/* Footer Security Note */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
            <Stack direction="row" spacing={0.8} alignItems="center" justifyContent="center">
              <LockIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                JWT Signed • End-to-End Encrypted Session
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
