import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';

/**
 * Reusable, responsive pagination component matching the application's clean design system.
 * 
 * @param {Object} props
 * @param {number} props.currentPage - 1-based active page number
 * @param {number} props.totalItems - Total count of items after filtering
 * @param {number} [props.pageSize=10] - Number of items shown per page
 * @param {Function} props.onPageChange - Callback when a page is selected: (newPage) => void
 * @param {string} [props.itemLabel] - Optional custom noun for items
 */
const PaginationControl = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  itemLabel,
}) => {
  if (totalItems <= 0) {
    return null;
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = (validPage - 1) * pageSize + 1;
  const endItem = Math.min(validPage * pageSize, totalItems);

  // Compute displayed page numbers with ellipsis for large page sets
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (validPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (validPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', validPage - 1, validPage, validPage + 1, '...', totalPages];
  };

  const pageNumbers = getPageNumbers();

  const handlePrev = () => {
    if (validPage > 1 && onPageChange) {
      onPageChange(validPage - 1);
    }
  };

  const handleNext = () => {
    if (validPage < totalPages && onPageChange) {
      onPageChange(validPage + 1);
    }
  };

  const handlePageClick = (page) => {
    if (typeof page === 'number' && page !== validPage && onPageChange) {
      onPageChange(page);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        px: { xs: 2, sm: 3 },
        py: 2,
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Information text */}
      <Typography
        variant="body2"
        sx={{
          color: '#64748b',
          fontWeight: 500,
          fontSize: '0.875rem',
          textAlign: { xs: 'center', sm: 'left' },
        }}
      >
        Showing <Box component="span" sx={{ fontWeight: 700, color: '#0f172a' }}>{startItem}-{endItem}</Box> of{' '}
        <Box component="span" sx={{ fontWeight: 700, color: '#0f172a' }}>{totalItems}</Box>
        {itemLabel ? ` ${itemLabel}` : ''}
      </Typography>

      {/* Pagination control buttons */}
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        sx={{
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: { xs: 0.5, sm: 0.75 },
        }}
      >
        {/* Previous button */}
        <Button
          size="small"
          variant="outlined"
          disabled={validPage <= 1}
          onClick={handlePrev}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            minWidth: 80,
            py: 0.5,
            px: 1.5,
            color: validPage <= 1 ? '#94a3b8' : '#334155',
            borderColor: '#e2e8f0',
            backgroundColor: validPage <= 1 ? '#f8fafc' : '#ffffff',
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: '#f1f5f9',
            },
            '&.Mui-disabled': {
              borderColor: '#e2e8f0',
              color: '#94a3b8',
              backgroundColor: '#f8fafc',
            },
          }}
        >
          &lt; Previous
        </Button>

        {/* Page number buttons */}
        {pageNumbers.map((p, index) => {
          if (p === '...') {
            return (
              <Box
                key={`ellipsis-${index}`}
                sx={{
                  px: 1,
                  py: 0.5,
                  color: '#94a3b8',
                  fontWeight: 600,
                  userSelect: 'none',
                }}
              >
                ...
              </Box>
            );
          }

          const isActive = p === validPage;

          return (
            <Button
              key={`page-${p}`}
              size="small"
              variant={isActive ? 'contained' : 'outlined'}
              onClick={() => handlePageClick(p)}
              sx={{
                minWidth: 36,
                height: 34,
                p: 0,
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.8125rem',
                borderRadius: 1.5,
                ...(isActive
                  ? {
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      boxShadow: '0 1px 2px 0 rgba(37, 99, 235, 0.3)',
                      '&:hover': {
                        backgroundColor: '#1d4ed8',
                      },
                    }
                  : {
                      borderColor: '#e2e8f0',
                      color: '#334155',
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        backgroundColor: '#f1f5f9',
                      },
                    }),
              }}
            >
              {p}
            </Button>
          );
        })}

        {/* Next button */}
        <Button
          size="small"
          variant="outlined"
          disabled={validPage >= totalPages}
          onClick={handleNext}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.8125rem',
            minWidth: 70,
            py: 0.5,
            px: 1.5,
            color: validPage >= totalPages ? '#94a3b8' : '#334155',
            borderColor: '#e2e8f0',
            backgroundColor: validPage >= totalPages ? '#f8fafc' : '#ffffff',
            '&:hover': {
              borderColor: '#cbd5e1',
              backgroundColor: '#f1f5f9',
            },
            '&.Mui-disabled': {
              borderColor: '#e2e8f0',
              color: '#94a3b8',
              backgroundColor: '#f8fafc',
            },
          }}
        >
          Next &gt;
        </Button>
      </Stack>
    </Box>
  );
};

export default PaginationControl;
