import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  CircularProgress,
  Stack,
  Chip,
  SvgIcon,
} from '@mui/material';
import './LoginPage.css';

// SVG Icons
const DexwoxBadgeIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      fill="currentColor"
      d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.2l6.8 3.8-3.4 1.9-6.8-3.8 3.4-1.9zm-8 4.6l7 3.9v7.7l-7-3.9V8.8zm9 11.6V12.7l7-3.9v7.7l-7 3.9z"
    />
  </SvgIcon>
);

const UserEmailIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
    />
    <polyline
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      points="22,6 12,13 2,6"
    />
  </SvgIcon>
);

const LockIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <rect
      x="3"
      y="11"
      width="18"
      height="11"
      rx="2"
      ry="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M7 11V7a5 5 0 0 1 10 0v4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </SvgIcon>
);

const VisibilityIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
  </SvgIcon>
);

const VisibilityOffIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
    <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" />
  </SvgIcon>
);

const AlertCircleIcon = (props) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
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
    const trimmed = email.trim();

    if (!trimmed) {
      errors.email = 'Username or email address is required';
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
      await login(email.trim(), password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err.isNetworkError) {
        setServerError('Cannot connect to backend server. Please verify backend is running.');
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
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        p: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '440px' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: '32px 24px', sm: '40px' },
            borderRadius: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Branding Header */}
          <Box sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <DexwoxBadgeIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography
              component="h1"
              sx={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#111827',
                lineHeight: 1.25,
                mb: 0.75,
              }}
            >
              Sign in to DEXWOX
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: 1.4,
              }}
            >
              Enter your corporate credentials to access the facility portal
            </Typography>
          </Box>

          {/* Error / Notice Banner */}
          {serverError && (
            <Box
              sx={{
                mb: 2.5,
                p: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <AlertCircleIcon
                sx={{
                  color: '#dc2626',
                  fontSize: 20,
                  mt: '2px',
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: '#dc2626',
                    lineHeight: 1.4,
                  }}
                >
                  {serverError}
                </Typography>
                {errorDetails && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      fontFamily: 'monospace',
                      fontSize: '11.5px',
                      color: '#dc2626',
                      opacity: 0.85,
                      mt: 0.5,
                    }}
                  >
                    {errorDetails}
                  </Typography>
                )}
              </Box>
            </Box>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              {/* Username / Email Field */}
              <Box>
                <Typography
                  component="label"
                  htmlFor="email"
                  sx={{
                    display: 'block',
                    mb: 0.75,
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Username or Corporate Email
                </Typography>
                <TextField
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username email"
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="admin@company.com or rohin"
                  value={email}
                  disabled={isLoading}
                  error={Boolean(clientErrors.email)}
                  helperText={clientErrors.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (clientErrors.email) setClientErrors({ ...clientErrors, email: null });
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2563eb',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: '#111827',
                      fontSize: '14px',
                      py: '10px',
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: '12px',
                      color: '#dc2626',
                      mt: 0.5,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <UserEmailIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Password Field */}
              <Box>
                <Typography
                  component="label"
                  htmlFor="password"
                  sx={{
                    display: 'block',
                    mb: 0.75,
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#374151',
                  }}
                >
                  Password
                </Typography>
                <TextField
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  fullWidth
                  variant="outlined"
                  size="small"
                  placeholder="••••••••••••"
                  value={password}
                  disabled={isLoading}
                  error={Boolean(clientErrors.password)}
                  helperText={clientErrors.password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (clientErrors.password) setClientErrors({ ...clientErrors, password: null });
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      '& fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2563eb',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: '#111827',
                      fontSize: '14px',
                      py: '10px',
                    },
                    '& .MuiFormHelperText-root': {
                      fontSize: '12px',
                      color: '#dc2626',
                      mt: 0.5,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#9ca3af', fontSize: 18 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{ color: '#6b7280' }}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <VisibilityIcon sx={{ fontSize: 18 }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Action Button */}
              <Button
                id="login-submit-btn"
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  height: '44px',
                  minHeight: '44px',
                  maxHeight: '44px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  textTransform: 'none',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  boxShadow: 'none',
                  mt: 1,
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                    boxShadow: 'none',
                  },
                  '&:disabled': {
                    backgroundColor: '#93c5fd',
                    color: '#ffffff',
                  },
                }}
              >
                {isLoading ? (
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                    <CircularProgress size={18} thickness={4} sx={{ color: '#ffffff' }} />
                    <span>Signing in...</span>
                  </Stack>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Stack>
          </Box>

          {/* Quick Demo Credentials Helper */}
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: '8px',
              backgroundColor: '#f9fafb',
              border: '1px dashed #e5e7eb',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#6b7280',
                display: 'block',
                mb: 1,
                fontWeight: 600,
                fontSize: '11px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Default Admin Credentials
            </Typography>

            <Chip
              label="admin@company.com / password"
              size="small"
              onClick={() => handleQuickFill('admin@company.com', 'password')}
              disabled={isLoading}
              clickable
              sx={{
                fontFamily: 'monospace',
                fontSize: '12px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                '&:hover': {
                  backgroundColor: '#dbeafe',
                },
              }}
            />
          </Box>

          {/* Footer Security Note */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e5e7eb', textAlign: 'center' }}>
            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="center">
              <LockIcon sx={{ fontSize: 13, color: '#9ca3af' }} />
              <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '12px' }}>
                DEXWOX EMS • End-to-End Encrypted Session
              </Typography>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default LoginPage;
