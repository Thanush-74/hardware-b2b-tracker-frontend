import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ReturnsIcon, ArrowRightIcon } from '../Icons';

const getReturnStatusStyle = (status) => {
  switch (status) {
    case 'Resolved':
    case 'Completed':
    case 'Approved':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    case 'Replacement Pending':
    case 'Replaced':
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    case 'Under Inspection':
    case 'Received':
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    case 'Rejected':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    case 'Requested':
    default:
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
  }
};

const ReturnsOverview = ({ data }) => {
  const navigate = useNavigate();

  const pendingReturns = data?.pendingReturns ?? 0;
  const approvedReturns = data?.approvedReturns ?? 0;
  const replacements = data?.replacements ?? 0;
  const recentReturns = data?.recentReturns || [];

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
            <ReturnsIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
              Returns & Replacements
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              RMA intake status, diagnostics, and component replacement tracking
            </Typography>
          </Box>
        </Stack>

        <Button
          size="small"
          variant="text"
          onClick={() => navigate('/returns')}
          endIcon={<ArrowRightIcon sx={{ fontSize: 16 }} />}
          sx={{ fontWeight: 600, fontSize: '0.8rem', color: '#2563eb' }}
        >
          View All RMAs
        </Button>
      </Box>

      {/* Metrics Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#fffbeb', border: '1px solid #fde68a', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Pending Returns
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#b45309' }}>
            {pendingReturns}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#15803d', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Approved Returns
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#15803d' }}>
            {approvedReturns}
          </Typography>
        </Box>

        <Box sx={{ p: 1.25, borderRadius: 1.5, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: '#1d4ed8', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.66rem', display: 'block' }}>
            Replacements
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#1d4ed8' }}>
            {replacements}
          </Typography>
        </Box>
      </Box>

      {/* Table */}
      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', mb: 1, display: 'block' }}>
        Active RMA Requests
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
        <Table size="small" sx={{ width: '100%', minWidth: 550 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                RMA #
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Customer & Product
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Reported Reason
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1 }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recentReturns && recentReturns.length > 0 ? (
              recentReturns.map((item) => {
                const statusStyle = getReturnStatusStyle(item.status);

                return (
                  <TableRow
                    key={item.id}
                    hover
                    onClick={() => navigate('/returns')}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', color: '#2563eb' }}>
                        {item.return_number}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                        {item.customer_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                        {item.product_name}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 180 }}>
                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', noWrap: true }}>
                        {item.return_reason}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Chip
                        label={item.status}
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
                  No active returns pending triage.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ReturnsOverview;

