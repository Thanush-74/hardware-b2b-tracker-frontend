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
import { InspectionIcon, ArrowRightIcon } from '../Icons';

const getResultStatusStyle = (result) => {
  switch (result) {
    case 'Approved':
    case 'Passed':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    case 'Defective':
    case 'Failed':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    case 'Pending':
    default:
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
  }
};

const QualityInspectionOverview = ({ data, hideHeader = false }) => {
  const navigate = useNavigate();

  const defectiveProducts = data?.defectiveProducts ?? 0;
  const pendingInspections = data?.pendingInspections ?? 0;
  const passRate = data?.passRate ?? 100;
  const totalInspected = data?.totalInspected ?? 0;
  const totalPassed = data?.totalPassed ?? 0;
  const recentInspections = data?.recentInspections || [];

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
              <InspectionIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                Quality & QA Inspection
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                First-pass yield, defect tracking & component audit records
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
      )}

      {/* Pass Rate Gauge Box */}
      <Box sx={{ p: 1.5, borderRadius: 1.5, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 0.75 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.68rem', display: 'block' }}>
              Quality Pass Rate
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: passRate >= 95 ? '#15803d' : '#b45309' }}>
              {passRate}%
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
            {totalPassed} / {totalInspected} Units Passed
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={Number(passRate)}
          sx={{
            height: 6,
            borderRadius: 3,
            backgroundColor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: passRate >= 95 ? '#16a34a' : '#d97706',
              borderRadius: 3,
            },
          }}
        />
      </Box>

      {/* 2 Quick Summary Pill Boxes */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 1.25,
          mb: 2,
        }}
      >
        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#fef2f2', border: '1px solid #fecaca', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#b91c1c', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Defects Found
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#b91c1c', mt: 0.25 }}>
            {defectiveProducts}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Pending QA
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309', mt: 0.25 }}>
            {pendingInspections}
          </Typography>
        </Box>
      </Box>

      {/* QA Inspection Audits Table */}
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', mb: 1, display: 'block' }}>
        Recent Inspection Logs
      </Typography>

      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          minWidth: 0,
          border: '1px solid #f1f5f9',
          borderRadius: 1.5,
          flexGrow: 1,
        }}
      >
        <Table size="small" sx={{ width: '100%', minWidth: 420 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.72rem', py: 1 }}>
                Product / Batch
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.72rem', py: 1 }}>
                Pass / Fail
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.72rem', py: 1 }}>
                Defect Notes
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.72rem', py: 1 }}>
                Result
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentInspections && recentInspections.length > 0 ? (
              recentInspections.map((audit) => {
                const statusStyle = getResultStatusStyle(audit.result);

                return (
                  <TableRow
                    key={audit.id}
                    hover
                    onClick={() => navigate('/inspection')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {audit.product_name || audit.item_type}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace' }}>
                        {audit.batch_number}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                        <span style={{ color: '#15803d' }}>{audit.passed_quantity}</span> / <span style={{ color: audit.failed_quantity > 0 ? '#b91c1c' : '#64748b' }}>{audit.failed_quantity}</span>
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="caption" sx={{ color: '#475569' }}>
                        {audit.defect_type || 'None (Pass)'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Chip
                        label={audit.result}
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
                <TableCell colSpan={4} sx={{ textAlign: 'center', py: 3, color: '#64748b' }}>
                  No QA audits recorded.
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
        height: '100%',
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {innerContent}
    </Paper>
  );
};

export default QualityInspectionOverview;
