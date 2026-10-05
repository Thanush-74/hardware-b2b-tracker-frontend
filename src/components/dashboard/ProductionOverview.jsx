import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  LinearProgress,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProductionIcon, ArrowRightIcon } from '../Icons';

const ProductionOverview = ({ data }) => {
  const navigate = useNavigate();

  const planned = data?.planned ?? 0;
  const inProgress = data?.inProgress ?? 0;
  const completed = data?.completed ?? 0;
  const delayed = data?.delayed ?? 0;
  const activeBuilds = data?.activeBuilds || [];

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
            <ProductionIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Production & PC Assembly
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Factory line status & workstation assembly throughput
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => navigate('/production')}
          endIcon={<ArrowRightIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#2563eb' }}
        >
          Manage Lines
        </Button>
      </Box>

      {/* 4 Summary Metric Pills */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            Planned
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {planned}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            In Progress
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
            {inProgress}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            Completed
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
            {completed}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: delayed > 0 ? '#fef2f2' : '#f8fafc', border: `1px solid ${delayed > 0 ? '#fecaca' : '#e2e8f0'}`, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: delayed > 0 ? '#b91c1c' : '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            Delayed
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: delayed > 0 ? '#b91c1c' : '#0f172a' }}>
            {delayed}
          </Typography>
        </Box>
      </Box>

      {/* Active Workstation Assembly Builds (2-Column Grid on Desktop, 1-Column on Mobile) */}
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 1.25, display: 'block' }}>
        Active Assembly Lines
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {activeBuilds.map((build) => {
          const isDelayed = build.status === 'Delayed';

          return (
            <Box
              key={build.id}
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                transition: 'border-color 0.15s ease',
                minWidth: 0,
                '&:hover': {
                  borderColor: '#cbd5e1',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                <Box sx={{ overflow: 'hidden', mr: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', noWrap: true }}>
                    {build.product_name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                    {build.assembly_line} • Lead: {build.lead_technician}
                  </Typography>
                </Box>
                <Chip
                  label={build.status}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    backgroundColor: isDelayed ? '#fef2f2' : '#eff6ff',
                    color: isDelayed ? '#b91c1c' : '#1d4ed8',
                    border: `1px solid ${isDelayed ? '#fecaca' : '#bfdbfe'}`,
                    flexShrink: 0,
                  }}
                />
              </Stack>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  {build.completed_qty} of {build.target_qty} units completed
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.72rem' }}>
                  {build.progress_pct}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={build.progress_pct}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: '#e5e7eb',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: isDelayed ? '#dc2626' : build.progress_pct >= 100 ? '#16a34a' : '#2563eb',
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default ProductionOverview;
