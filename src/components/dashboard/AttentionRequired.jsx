import React from 'react';
import { Box, Paper, Typography, Stack, Button, Chip, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { WarningIcon, ArrowRightIcon } from '../Icons';

const getSeverityStyle = (severity) => {
  switch (severity) {
    case 'error':
      return {
        bg: '#fef2f2',
        color: '#b91c1c',
        border: '#fecaca',
        iconBg: '#fee2e2',
      };
    case 'warning':
      return {
        bg: '#fffbeb',
        color: '#b45309',
        border: '#fde68a',
        iconBg: '#fef3c7',
      };
    case 'info':
    default:
      return {
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#bfdbfe',
        iconBg: '#dbeafe',
      };
  }
};

const AttentionRequired = ({ items = [] }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: 1,
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WarningIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
              Attention Required
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Operational exceptions requiring management intervention today
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          {items.map((item) => {
            const style = getSeverityStyle(item.severity);

            return (
              <Box
                key={item.id}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  transition: 'border-color 0.15s ease',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                  },
                }}
              >
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Chip
                      label={item.badge || 'Exception'}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: style.bg,
                        color: style.color,
                        border: `1px solid ${style.border}`,
                      }}
                    />
                    {item.timestamp && (
                      <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.72rem' }}>
                        {item.timestamp}
                      </Typography>
                    )}
                  </Stack>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.5 }}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.82rem', mb: 1.5 }}>
                    {item.description}
                  </Typography>
                </Box>

                {item.route && (
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => navigate(item.route)}
                    endIcon={<ArrowRightIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      alignSelf: 'flex-start',
                      p: 0,
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      color: '#2563eb',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#1d4ed8',
                      },
                    }}
                  >
                    {item.actionText || 'Take Action'}
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};

export default AttentionRequired;
