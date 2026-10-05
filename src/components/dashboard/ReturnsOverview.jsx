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
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
    case 'Replacement Pending':
    case 'Replaced':
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    case 'Under Inspection':
    case 'Received':
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' };
    case 'Approved for Rework':
      return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
    case 'Rejected':
      return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
    case 'Requested':
    default:
      return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  }
};

const ReturnsOverview = ({ items = [] }) => {
  const navigate = useNavigate();

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.5 }, pb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              Return & Replacement Traceability
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

      <TableContainer
        sx={{
          width: '100%',
          overflowX: 'auto',
          minWidth: 0,
          '&::-webkit-scrollbar': { height: '5px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(148, 163, 184, 0.25)', borderRadius: '4px' },
        }}
      >
        <Table size="small" sx={{ width: '100%', minWidth: 680 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                RMA #
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Customer & Hardware Item
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2 }}>
                Reported Defect / Reason
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Replacement
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Status
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem', py: 1.2, whiteSpace: 'nowrap' }}>
                Intake Logged
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items && items.length > 0 ? (
              items.map((item) => {
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
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>
                        {item.product_name}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.78rem' }}>
                        {item.return_reason}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={item.replacement_required ? 'Required' : 'Inspect Only'}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          backgroundColor: item.replacement_required ? '#eff6ff' : '#f8fafc',
                          color: item.replacement_required ? '#2563eb' : '#64748b',
                          border: `1px solid ${item.replacement_required ? '#bfdbfe' : '#e2e8f0'}`,
                        }}
                      />
                    </TableCell>

                    <TableCell>
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

                    <TableCell align="right">
                      <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {item.received_date}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#64748b' }}>
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
