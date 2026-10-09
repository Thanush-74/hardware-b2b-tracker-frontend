import React from 'react';
import { Box, CircularProgress, Typography, Fade } from '@mui/material';

/**
 * Modern page loading fallback for React.Suspense
 */
const PageLoader = ({ message = 'Loading workspace...' }) => {
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 4,
        }}
      >
        <CircularProgress
          size={36}
          thickness={4}
          sx={{
            color: 'primary.main',
          }}
        />
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontWeight: 500,
            letterSpacing: '0.02em',
          }}
        >
          {message}
        </Typography>
      </Box>
    </Fade>
  );
};

export default PageLoader;
