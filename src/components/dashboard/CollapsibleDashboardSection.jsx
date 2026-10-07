import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Collapse,
  Chip,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChevronDownIcon, ChevronUpIcon, ArrowRightIcon } from '../Icons';

/**
 * CollapsibleDashboardSection
 * Clean, collapsible card wrapper for dashboard operational modules.
 * Shows high-level summary chips even when collapsed so users can quickly understand
 * key data at a glance without information overload.
 */
const CollapsibleDashboardSection = ({
  title,
  subtitle,
  icon,
  iconBg = '#eff6ff',
  iconColor = '#2563eb',
  summaryBadges = [],
  isOpen,
  onToggle,
  route,
  actionLabel = 'View Full Page',
  children,
}) => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        backgroundColor: '#ffffff',
        border: '1px solid',
        borderColor: isOpen ? '#cbd5e1' : '#e2e8f0',
        boxShadow: isOpen ? '0 4px 16px -2px rgba(15, 23, 42, 0.05)' : '0 1px 3px 0 rgba(0, 0, 0, 0.03)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        width: '100%',
        minWidth: 0,
      }}
    >
      {/* Clickable Header */}
      <Box
        onClick={onToggle}
        sx={{
          p: { xs: 1.75, sm: 2.25 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          cursor: 'pointer',
          backgroundColor: isOpen ? '#fafcff' : '#ffffff',
          borderBottom: isOpen ? '1px solid #f1f5f9' : 'none',
          userSelect: 'none',
          '&:hover': {
            backgroundColor: isOpen ? '#f1f7fe' : '#f8fafc',
          },
        }}
      >
        {/* Left: Icon + Title + Subtitle */}
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              backgroundColor: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.2,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                }}
              >
                {title}
              </Typography>
            </Stack>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.78rem',
                  display: 'block',
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        {/* Right: Summary Badges + Action + Expand/Collapse Button */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            alignSelf: { xs: 'stretch', sm: 'center' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            flexWrap: 'wrap',
            gap: 0.75,
          }}
          onClick={(e) => {
            // Keep button clicks from double triggering if needed, but let row expand
          }}
        >
          {/* Summary Badges (Always visible, very helpful when collapsed) */}
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            {summaryBadges.map((badge, idx) => (
              <Chip
                key={idx}
                label={badge.label}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  backgroundColor: badge.bg || '#f1f5f9',
                  color: badge.color || '#475569',
                  border: `1px solid ${badge.border || '#e2e8f0'}`,
                }}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {route && (
              <Button
                size="small"
                variant="text"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(route);
                }}
                endIcon={<ArrowRightIcon sx={{ fontSize: 14 }} />}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  color: '#2563eb',
                  textTransform: 'none',
                  px: 1,
                  py: 0.25,
                  minWidth: 'auto',
                  display: { xs: 'none', md: 'inline-flex' },
                  '&:hover': {
                    backgroundColor: '#eff6ff',
                  },
                }}
              >
                {actionLabel}
              </Button>
            )}

            <Tooltip title={isOpen ? 'Click to collapse section' : 'Click to expand details'}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 1.5,
                  backgroundColor: isOpen ? '#eff6ff' : '#f8fafc',
                  border: `1px solid ${isOpen ? '#bfdbfe' : '#e2e8f0'}`,
                  color: isOpen ? '#2563eb' : '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{isOpen ? 'Collapse' : 'Expand'}</span>
                {isOpen ? <ChevronUpIcon sx={{ fontSize: 16 }} /> : <ChevronDownIcon sx={{ fontSize: 16 }} />}
              </Box>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit={false}>
        <Box sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: 1.5, sm: 2 } }}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default CollapsibleDashboardSection;
