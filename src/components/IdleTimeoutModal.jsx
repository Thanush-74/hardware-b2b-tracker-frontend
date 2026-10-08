import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
} from '@mui/material';

/**
 * Idle Timeout Warning Modal
 * Appears 1 minute before automatic logout when the user has been inactive.
 * Provides a clear "Stay Logged In" button to reset the idle timer.
 */
const IdleTimeoutModal = ({ open, secondsRemaining, onStayLoggedIn, onLogout }) => {
  const displayMessage =
    secondsRemaining >= 55 && secondsRemaining <= 65
      ? 'You have been inactive. You will be logged out in 1 minute.'
      : `You have been inactive. You will be logged out in ${secondsRemaining} second${secondsRemaining === 1 ? '' : 's'}.`;

  return (
    <Dialog
      open={open}
      onClose={onStayLoggedIn}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(3px)',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
          },
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, pt: 2, px: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            ⏱
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>
              Session Inactivity Warning
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Automatic security logout
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 2, py: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#92400e', fontWeight: 600, mb: 1 }}>
            {displayMessage}
          </Typography>
          <Typography variant="caption" sx={{ color: '#78350f', display: 'block' }}>
            To protect your account, your session will automatically end if no activity is detected.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
          <Chip
            label={`${secondsRemaining}s remaining`}
            color={secondsRemaining <= 15 ? 'error' : 'warning'}
            variant="outlined"
            size="small"
            sx={{ fontWeight: 700, px: 1 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button
          variant="outlined"
          onClick={onLogout}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#cbd5e1',
            color: '#475569',
            '&:hover': {
              borderColor: '#94a3b8',
              backgroundColor: '#f8fafc',
            },
          }}
        >
          Sign Out Now
        </Button>
        <Button
          variant="contained"
          onClick={onStayLoggedIn}
          sx={{
            flex: 1,
            textTransform: 'none',
            fontWeight: 700,
            backgroundColor: '#2563eb',
            '&:hover': {
              backgroundColor: '#1d4ed8',
            },
          }}
        >
          Stay Logged In
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IdleTimeoutModal;
