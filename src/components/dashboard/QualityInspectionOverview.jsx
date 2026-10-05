import React from 'react';
import { Paper, Box, Typography, Stack, Button, Grid, LinearProgress, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { InspectionIcon, ArrowRightIcon } from '../Icons';

const QualityInspectionOverview = ({ data }) => {
  const navigate = useNavigate();

  const passRate = data?.passRate ?? 96.5;
  const inspectedToday = data?.inspectedToday ?? 0;
  const passedToday = data?.passedToday ?? 0;
  const failedToday = data?.failedToday ?? 0;
  const reworkPending = data?.reworkPending ?? 0;
  const recentAudits = data?.recentAudits || [];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        p: { xs: 2, sm: 2.5 },
        height: '100%',
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
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
            <InspectionIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Quality & Yield Control
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              SMT optical inspection & factory pass rate
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => navigate('/inspection')}
          endIcon={<ArrowRightIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#2563eb' }}
        >
          Audit Reports
        </Button>
      </Box>

      {/* Pass Rate Gauge Box */}
      <Box sx={{ p: 2, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem' }}>
              First-Pass Factory Yield
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#15803d', lineHeight: 1.1, mt: 0.25 }}>
              {passRate}%
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            {passedToday} of {inspectedToday} units verified
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={passRate}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: '#e5e7eb',
            '& .MuiLinearProgress-bar': {
              backgroundColor: passRate >= 95 ? '#15803d' : '#b45309',
              borderRadius: 3,
            },
          }}
        />
      </Box>

      {/* Small Stat Pills */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.68rem', display: 'block' }}>
            Passed
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
            {passedToday}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.68rem', display: 'block' }}>
            Failed
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: failedToday > 0 ? '#b91c1c' : '#0f172a' }}>
            {failedToday}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#ffffff', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.68rem', display: 'block' }}>
            Rework
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: reworkPending > 0 ? '#b45309' : '#0f172a' }}>
            {reworkPending}
          </Typography>
        </Box>
      </Box>

      {/* Recent Audits preview */}
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', mb: 1, display: 'block' }}>
        Recent Batch Inspections
      </Typography>

      <Stack spacing={1} sx={{ flexGrow: 1 }}>
        {recentAudits.map((audit) => (
          <Box
            key={audit.id}
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.82rem' }}>
                {audit.product}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                {audit.batch_number} • {audit.inspector}
              </Typography>
            </Box>
            <Chip
              label={audit.result}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.68rem',
                fontWeight: 700,
                backgroundColor: audit.result === 'Passed' ? '#f0fdf4' : '#fef2f2',
                color: audit.result === 'Passed' ? '#15803d' : '#b91c1c',
                border: `1px solid ${audit.result === 'Passed' ? '#bbf7d0' : '#fecaca'}`,
              }}
            />
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};

export default QualityInspectionOverview;
