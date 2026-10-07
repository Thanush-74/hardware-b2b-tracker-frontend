import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  Avatar,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ManufacturingIcon, ArrowRightIcon, StaffIcon } from '../Icons';

const ManufacturingOverview = ({ data }) => {
  const navigate = useNavigate();

  const totalAssignments = data?.totalAssignments ?? 0;
  const workingCount = data?.workingCount ?? 0;
  const onBreakCount = data?.onBreakCount ?? 0;
  const standbyCount = data?.standbyCount ?? 0;
  const sectors = data?.sectors || [];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        p: { xs: 2, sm: 2.5 },
        width: '100%',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ManufacturingIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Manufacturing Overview
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Line deployment & technician sector coverage for GPU, RAM, ROM/SSD & Motherboard
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => navigate('/manufacturing')}
          endIcon={<ArrowRightIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#2563eb' }}
        >
          View Manufacturing Floor
        </Button>
      </Box>

      {/* Top Stat Summary Strip */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Total Station Assignments
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.25 }}>
            {totalAssignments}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Currently Working
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d', mt: 0.25 }}>
            {workingCount}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            On Break
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309', mt: 0.25 }}>
            {onBreakCount}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Standby / Available
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.25 }}>
            {standbyCount}
          </Typography>
        </Box>
      </Box>

      {/* 4 Canonical Product Lines Overview Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'minmax(0, 1fr)',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {sectors.map((line) => (
          <Box
            key={line.key}
            onClick={() => navigate('/manufacturing')}
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: '#2563eb',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.08)',
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {line.name}
              </Typography>
              <Chip
                label={line.activeWorking > 0 ? '● Active' : 'Standby'}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: line.activeWorking > 0 ? '#f0fdf4' : '#f1f5f9',
                  color: line.activeWorking > 0 ? '#15803d' : '#64748b',
                  border: `1px solid ${line.activeWorking > 0 ? '#bbf7d0' : '#e2e8f0'}`,
                }}
              />
            </Stack>

            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 1.5 }}>
              Coverage: {line.shiftSummary}
            </Typography>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <StaffIcon sx={{ fontSize: 15, color: '#64748b' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155' }}>
                  {line.totalAssigned} Staff Assigned
                </Typography>
              </Box>

              <Typography variant="caption" sx={{ fontWeight: 700, color: '#15803d' }}>
                {line.activeWorking} Working
              </Typography>
            </Stack>

            {line.technicians && line.technicians.length > 0 && (
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.75, fontSize: '0.7rem' }}>
                Technicians: {line.technicians.join(', ')}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default ManufacturingOverview;
