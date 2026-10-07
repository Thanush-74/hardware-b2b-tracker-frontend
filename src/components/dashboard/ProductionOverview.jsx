import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ProductionIcon, ArrowRightIcon } from '../Icons';

const getProductionStatusStyle = (status) => {
  switch (status) {
    case 'Completed':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    case 'In Production':
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    case 'Cancelled':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    case 'Planned':
    default:
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
  }
};

const ProductionOverview = ({ data, hideHeader = false }) => {
  const navigate = useNavigate();

  const totalBatches = data?.totalBatches ?? 0;
  const unitsPlanned = data?.unitsPlanned ?? 0;
  const unitsProducing = data?.unitsProducing ?? 0;
  const unitsCompleted = data?.unitsCompleted ?? 0;
  const weeklyCapacity = data?.weeklyCapacity ?? 0;
  const batches = data?.batches || [];

  const innerContent = (
    <Box sx={{ width: '100%' }}>
      {!hideHeader && (
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
                Production Overview
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                Factory line assembly throughput, planned runs, and capacity
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
            Manage Production
          </Button>
        </Box>
      )}

      {/* 5 Production Summary Metric Boxes */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', display: 'block' }}>
            Total Batches
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            {totalBatches}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', display: 'block' }}>
            Units Planned
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#1d4ed8', mt: 0.5 }}>
            {unitsPlanned.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', display: 'block' }}>
            In Production
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#b45309', mt: 0.5 }}>
            {unitsProducing.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', display: 'block' }}>
            Units Completed
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
            {unitsCompleted.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', display: 'block' }}>
            Weekly Capacity
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
            {weeklyCapacity > 0 ? `${weeklyCapacity.toLocaleString()} / wk` : 'N/A'}
          </Typography>
        </Box>
      </Box>

      {/* Production Batches Table */}
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', mb: 1, display: 'block' }}>
        Active & Recent Production Runs
      </Typography>

      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          minWidth: 0,
          border: '1px solid #f1f5f9',
          borderRadius: 1.5,
        }}
      >
        <Table size="small" sx={{ width: '100%', minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Batch ID & Product
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Planned
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Producing
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Completed
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1, minWidth: 140 }}>
                Progress
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches && batches.length > 0 ? (
              batches.map((batch) => {
                const statusStyle = getProductionStatusStyle(batch.status);

                return (
                  <TableRow
                    key={batch.id}
                    hover
                    onClick={() => navigate('/production')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {batch.product_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                        Batch #{batch.id} • Target ETA: {batch.expected_completion}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {batch.quantity_planned}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#b45309' }}>
                        {batch.quantity_producing}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#15803d' }}>
                        {batch.quantity_completed}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ width: '100%' }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                            {batch.quantity_completed} / {batch.quantity_planned}
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.7rem' }}>
                            {batch.progress_pct}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={batch.progress_pct}
                          sx={{
                            height: 5,
                            borderRadius: 3,
                            backgroundColor: '#e5e7eb',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: batch.progress_pct >= 100 ? '#16a34a' : '#2563eb',
                              borderRadius: 3,
                            },
                          }}
                        />
                      </Box>
                    </TableCell>

                    <TableCell align="right">
                      <Chip
                        label={batch.status}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 3, color: '#64748b' }}>
                  No active production batches found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  if (hideHeader) {
    return innerContent;
  }

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
      {innerContent}
    </Paper>
  );
};

export default ProductionOverview;
